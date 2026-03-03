/**
 * Adds hreflang tags to all server-side meta generators.
 * For each file: adds require('./hreflangHelper') and inserts hreflang tags after canonical.
 */

const fs = require('fs');
const path = require('path');

const UTILS_DIR = path.resolve(__dirname, '..', 'server', 'src', 'utils');
const REQUIRE_LINE = "const { generateHreflangTags } = require('./hreflangHelper');";

const files = [
  'metaGenerator.js',
  'courseMetaGenerator.js',
  'lectureMetaGenerator.js',
  'academyMetaGenerator.js',
  'clubMetaGenerator.js',
  'initiativeMetaGenerator.js',
  'projectMetaGenerator.js',
  'storyMetaGenerator.js',
  'publicationMetaGenerator.js',
  'gamesMetaGenerator.js',
  'mentorMetaGenerator.js',
];

for (const file of files) {
  const filePath = path.join(UTILS_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has hreflang
  if (content.includes('generateHreflangTags')) {
    console.log(`SKIP (already updated): ${file}`);
    continue;
  }

  // 1. Add require at top (after first comment block or at very beginning)
  const firstFunctionMatch = content.match(/^(\/\*\*[\s\S]*?\*\/\s*\n)/);
  if (firstFunctionMatch) {
    content = content.replace(firstFunctionMatch[0], firstFunctionMatch[0] + REQUIRE_LINE + '\n\n');
  } else {
    content = REQUIRE_LINE + '\n\n' + content;
  }

  // 2. Find canonical URL patterns and extract path variable
  // Pattern A: <link rel="canonical" href="${url}">
  // Pattern B: <link rel="canonical" href="https://pensa.club/PATH" />

  // Replace all canonical link tags by adding hreflang after them
  // For Pattern A (using ${url} variable):
  content = content.replace(
    /(<link rel="canonical" href="\$\{url\}"[^>]*>)/g,
    (match) => {
      return match + '\n    \${generateHreflangTags(url.replace(\'https://pensa.club\', \'\'))}';
    }
  );

  // For Pattern B (hardcoded URL): extract the path part
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/pensa\.club(\/[^"]*)"[^>]*>)/g,
    (match, fullTag, urlPath) => {
      // Check if this was already handled by Pattern A
      if (match.includes('${url}')) return match;
      return match + `\n  \${generateHreflangTags(\`${urlPath}\`)}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${file}`);
}

console.log('\nDone!');
