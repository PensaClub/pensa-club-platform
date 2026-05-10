// server/src/services/llmScorer.js
//
// Phase 4: LLM-based relevance scoring for findings. Wraps @anthropic-ai/sdk
// with prompt caching, retry, cost tracking and a hard daily-cost guard so a
// runaway scoring loop can't drain the bot's budget.
//
// Public API:
//   scoreFinding(bot, finding) → { score, reasoning, tokensIn, tokensOut, costUsd, model, error? }
//   buildSystemPrompt(bot)     → string  (so the UI can preview the exact prompt)
//   buildUserPrompt(finding)   → string
//   resetDailyCounters(bot)    → reset llmTokensInToday/OutToday/CostToday on first use of new day
//   MODELS                     → list of supported models for UI dropdown

let AnthropicLib = null;
try {
    // Lazy require so missing dep at boot doesn't kill the server. If
    // useLlm is never enabled, we never load the SDK either.
    AnthropicLib = require('@anthropic-ai/sdk');
} catch (_) {
    // Will be reported when first scoring attempt happens.
}

// Model catalog. Pricing in USD per 1M tokens (input / output).
// Update these as Anthropic publishes new pricing — they're only used for
// our own cost-cap math, not billed to anyone.
const MODELS = {
    'claude-haiku-4-5': {
        id: 'claude-haiku-4-5',
        label: 'Haiku 4.5 — fast + cheap',
        inputPricePer1M: 0.80,
        outputPricePer1M: 4.00,
    },
    'claude-sonnet-4-6': {
        id: 'claude-sonnet-4-6',
        label: 'Sonnet 4.6 — balanced',
        inputPricePer1M: 3.00,
        outputPricePer1M: 15.00,
    },
    'claude-opus-4-7': {
        id: 'claude-opus-4-7',
        label: 'Opus 4.7 — most capable',
        inputPricePer1M: 15.00,
        outputPricePer1M: 75.00,
    },
};

const DEFAULT_MODEL = 'claude-haiku-4-5';

const DEFAULT_SYSTEM_PROMPT = `Ти си AI асистент който оценява релевантността на новинарски статии за editorial екип.

Тема на бота: {bot_description}
Ключови думи на бота: {keywords}

За всяка статия която ти давам, върни ЕДИНСТВЕНО валиден JSON обект (без markdown, без обяснения извън JSON-а), със следната структура:
{ "score": <число 0-100>, "reasoning": "<1-2 изречения на български защо> " }

Скала за score-а:
- 80-100: Пряко свързано с темата, отлично за статия
- 50-79: Тангенциално свързано, възможен ъгъл
- 20-49: Слабо свързано, вероятно не си заслужава
- 0-19: Off-topic / спам

Бъди стриктен. Екипът има нужда от signal, не noise.`;

const buildSystemPrompt = (bot) => {
    const tpl = (bot && bot.llmSystemPrompt) ? bot.llmSystemPrompt : DEFAULT_SYSTEM_PROMPT;
    const description = bot?.description || '(няма описание)';
    const keywords = Array.isArray(bot?.criteria?.keywords) && bot.criteria.keywords.length
        ? bot.criteria.keywords.join(', ')
        : '(без ключови думи)';
    let out = String(tpl)
        .replaceAll('{bot_description}', description)
        .replaceAll('{keywords}', keywords)
        .replaceAll('{bot_name}', bot?.name || '');
    const extra = (bot && bot.llmExtraInstructions) ? String(bot.llmExtraInstructions).trim() : '';
    if (extra) {
        out += `\n\nДопълнителни инструкции от admin:\n${extra}`;
    }
    return out;
};

const buildUserPrompt = (finding) => {
    const title = finding?.title || '(без заглавие)';
    const desc = finding?.description ? String(finding.description).slice(0, 1000) : '';
    const link = finding?.externalUrl || finding?.link || '';
    return `Заглавие: ${title}\n\nОписание: ${desc || '(няма)'}\n\nURL: ${link}`;
};

const todayDateOnly = () => {
    // YYYY-MM-DD in Europe/Sofia — keeps the daily window aligned with the
    // admin's calendar regardless of server TZ.
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia' }).format(new Date());
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
};

// Reset the per-day counters when we cross into a new Sofia day. Idempotent
// + race-safe enough for the 1-bot-at-a-time engine model.
const resetDailyCountersIfNewDay = async (bot) => {
    const today = todayDateOnly();
    if (bot.llmCostResetDate !== today) {
        try {
            await bot.update({
                llmTokensInToday: 0,
                llmTokensOutToday: 0,
                llmCostToday: 0,
                llmCostResetDate: today,
            });
        } catch (e) {
            console.warn('[llmScorer] daily reset failed:', e?.message);
        }
    }
};

const computeCostUsd = (model, tokensIn, tokensOut) => {
    const m = MODELS[model] || MODELS[DEFAULT_MODEL];
    const inCost = (tokensIn / 1_000_000) * m.inputPricePer1M;
    const outCost = (tokensOut / 1_000_000) * m.outputPricePer1M;
    return inCost + outCost;
};

// Extract { score, reasoning } from Claude's text response. We ask for JSON
// but defensively handle cases where the model wraps it in prose / markdown.
const parseLLMResponse = (text) => {
    if (!text) return { score: null, reasoning: null };
    // Try strict JSON parse first.
    try {
        const parsed = JSON.parse(text.trim());
        return {
            score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : null,
            reasoning: parsed.reasoning ? String(parsed.reasoning) : null,
        };
    } catch (_) { /* fall through */ }
    // Best-effort: find the first {...} block.
    const m = text.match(/\{[\s\S]*?\}/);
    if (m) {
        try {
            const parsed = JSON.parse(m[0]);
            return {
                score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : null,
                reasoning: parsed.reasoning ? String(parsed.reasoning) : null,
            };
        } catch (_) { /* fall through */ }
    }
    // Last resort: regex score lookup.
    const scoreMatch = text.match(/"?score"?\s*[:=]\s*(\d{1,3})/i);
    if (scoreMatch) {
        return {
            score: Math.max(0, Math.min(100, parseInt(scoreMatch[1], 10))),
            reasoning: text.slice(0, 300),
        };
    }
    return { score: null, reasoning: text.slice(0, 300) };
};

// Single retry with backoff on transient errors. Anthropic's SDK already
// retries on 429/5xx but we layer a tiny safety net for socket flakes.
const withRetry = async (fn) => {
    try {
        return await fn();
    } catch (err) {
        const code = err?.status || err?.code;
        if (code === 429 || code === 500 || code === 502 || code === 503 || code === 'ECONNRESET') {
            await new Promise((r) => setTimeout(r, 800));
            return fn();
        }
        throw err;
    }
};

// MAIN ENTRY: score a single finding for a bot. Always returns an object;
// errors land in the `error` field rather than throwing — the engine should
// still save the finding even if scoring fails (just without a score).
const scoreFinding = async (bot, finding) => {
    const out = {
        score: null,
        reasoning: null,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        model: bot?.llmModel || DEFAULT_MODEL,
        error: null,
    };

    if (!AnthropicLib) {
        out.error = 'SDK_NOT_INSTALLED';
        return out;
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        out.error = 'NO_API_KEY';
        return out;
    }

    // Cost cap guard — refuse to call API if today's spend already at cap.
    await resetDailyCountersIfNewDay(bot);
    const cap = Number(bot.llmDailyCostCap) || 0;
    const spent = Number(bot.llmCostToday) || 0;
    if (cap > 0 && spent >= cap) {
        out.error = 'COST_CAP_REACHED';
        return out;
    }

    const Anthropic = AnthropicLib.default || AnthropicLib;
    const client = new Anthropic({ apiKey });

    const systemPrompt = buildSystemPrompt(bot);
    const userPrompt = buildUserPrompt(finding);
    const model = MODELS[bot.llmModel] ? bot.llmModel : DEFAULT_MODEL;
    const temperature = Number(bot.llmTemperature) || 0;
    const maxTokens = Math.min(Math.max(parseInt(bot.llmMaxTokens, 10) || 300, 50), 2000);

    try {
        const resp = await withRetry(() => client.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            system: [
                {
                    type: 'text',
                    text: systemPrompt,
                    // Prompt caching: the system prompt rarely changes per
                    // bot; flag it cacheable so repeated scoring within the
                    // same 5-min window costs ~10% of the regular input price.
                    cache_control: { type: 'ephemeral' },
                },
            ],
            messages: [{ role: 'user', content: userPrompt }],
        }));

        const usage = resp.usage || {};
        out.tokensIn = (usage.input_tokens || 0)
            + (usage.cache_creation_input_tokens || 0)
            + (usage.cache_read_input_tokens || 0);
        out.tokensOut = usage.output_tokens || 0;
        out.costUsd = computeCostUsd(model, out.tokensIn, out.tokensOut);

        // First text block is the model's answer.
        const text = Array.isArray(resp.content) && resp.content.length
            ? (resp.content[0].text || '')
            : '';
        const parsed = parseLLMResponse(text);
        out.score = parsed.score;
        out.reasoning = parsed.reasoning;
    } catch (err) {
        out.error = err?.status ? `HTTP_${err.status}` : (err?.code || 'API_ERROR');
        console.error('[llmScorer] API call failed:', err?.message || err);
    }

    // Update bot's running counters. Best-effort — failure here is just a
    // missed stat, not a blocker.
    try {
        await bot.increment({
            llmTokensInToday: out.tokensIn,
            llmTokensOutToday: out.tokensOut,
            llmCostToday: out.costUsd,
        });
    } catch (e) {
        console.warn('[llmScorer] counter update failed:', e?.message);
    }

    return out;
};

module.exports = {
    scoreFinding,
    buildSystemPrompt,
    buildUserPrompt,
    parseLLMResponse,
    resetDailyCountersIfNewDay,
    computeCostUsd,
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_MODEL,
    MODELS,
};
