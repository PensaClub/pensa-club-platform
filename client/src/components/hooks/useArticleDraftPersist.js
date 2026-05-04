// useArticleDraftPersist.js
//
// Persists the article create/edit form draft into localStorage so the
// user does not lose work when the tab crashes / browser refreshes /
// they accidentally navigate away. Designed to be a drop-in for both
// create (articleId === undefined) and edit (articleId === <id>) flows.
//
// Storage shape (per draft key):
//   {
//     savedAt: ISO-8601 string,
//     payload: <values snapshot from useCreateArticle>,
//   }
//
// Storage key:
//   article-draft-v1-<userId>-<articleId|new>
//
// Lifecycle:
//   - On mount: scans for stale drafts (> 30 days) and removes them, then
//     looks at the current key.
//       * Create mode + draft exists → auto-restore (toast info), expose
//         discardDraft() so caller can offer "Изтрий възстановения".
//       * Edit mode + draft.savedAt > serverUpdatedAt + payload differs →
//         expose hasConflict so the form can render a banner.
//   - On every `values` change: debounced (500ms) write to localStorage.
//   - On submit success: caller invokes clearDraft().
//   - Multi-tab: 'storage' event listener flips hasExternalChange so the
//     form can warn the user another tab modified the same draft.
//
// Failure modes are non-fatal — QuotaExceededError sets an internal flag
// and stops attempting writes (toast warning), other errors are logged.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const KEY_PREFIX = 'article-draft-v1-';
const DEBOUNCE_MS = 500;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readAuthUserId = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    // Spec says auth.userId; in this project the JWT carries userId so we
    // fall back to email when the explicit field is not stored locally.
    return auth.userId || auth.email || 'anon';
  } catch {
    return 'anon';
  }
};

const purgeStaleDrafts = () => {
  try {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      const entry = safeParse(localStorage.getItem(k));
      if (!entry || !entry.savedAt) {
        keysToRemove.push(k);
        continue;
      }
      const savedAtMs = new Date(entry.savedAt).getTime();
      if (Number.isNaN(savedAtMs) || now - savedAtMs > TTL_MS) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
    });
  } catch (e) {
    // localStorage unavailable (private mode etc) — silently bail.
  }
};

// Cheap structural equality good enough for "did the user actually change
// anything compared to server"; JSON.stringify with stable property order
// is not guaranteed but fields here are produced by the same hook so the
// order is consistent in practice.
const deepEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

export const useArticleDraftPersist = ({
  articleId,
  values,
  setValues,
  isEditMode,
  serverUpdatedAt,
  enabled = true,
}) => {
  const userId = useMemo(() => readAuthUserId(), []);
  const storageKey = useMemo(
    () => `${KEY_PREFIX}${userId}-${articleId || 'new'}`,
    [userId, articleId]
  );

  const [hasConflict, setHasConflict] = useState(false);
  const [hasExternalChange, setHasExternalChange] = useState(false);
  const [persistDisabled, setPersistDisabled] = useState(false);

  const conflictPayloadRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const initializedRef = useRef(false);
  const lastWrittenRef = useRef(null);

  // -------- mount: TTL purge + initial restore/conflict detection ------
  useEffect(() => {
    if (!enabled) return undefined;

    purgeStaleDrafts();

    let cancelled = false;

    try {
      const raw = localStorage.getItem(storageKey);
      const draft = safeParse(raw);

      if (draft && draft.payload) {
        if (!isEditMode) {
          // CREATE mode — auto-restore, no banner needed.
          if (!cancelled) {
            setValues(draft.payload);
            try {
              toast.info('Възстановен е незапазен черновик', { role: 'alert' });
            } catch (e) { /* ignore */ }
          }
        } else {
          // EDIT mode — only flag conflict when draft is newer than server
          // AND the snapshot actually differs from current (server) values.
          const draftMs = new Date(draft.savedAt).getTime();
          const serverMs = serverUpdatedAt
            ? new Date(serverUpdatedAt).getTime()
            : 0;

          if (
            !Number.isNaN(draftMs) &&
            draftMs > serverMs &&
            !deepEqual(draft.payload, values)
          ) {
            conflictPayloadRef.current = draft.payload;
            if (!cancelled) setHasConflict(true);
          }
        }
      }
    } catch (e) {
      // ignore — a flaky localStorage shouldn't break the form mount.
    }

    initializedRef.current = true;

    return () => {
      cancelled = true;
    };
    // We intentionally only run this on mount — re-running would clobber
    // user edits that happened after we restored the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- debounced auto-save on values change ---------------
  useEffect(() => {
    if (!enabled || persistDisabled) return undefined;
    if (!initializedRef.current) return undefined;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const entry = {
          savedAt: new Date().toISOString(),
          payload: values,
        };
        localStorage.setItem(storageKey, JSON.stringify(entry));
        lastWrittenRef.current = entry.savedAt;
      } catch (err) {
        if (
          err &&
          (err.name === 'QuotaExceededError' ||
            err.code === 22 ||
            err.code === 1014)
        ) {
          setPersistDisabled(true);
          try {
            toast.warning(
              'Локалното съхранение е пълно — автоматичното запазване е спряно. Запази статията колкото може по-скоро.',
              { role: 'alert' }
            );
          } catch (e) { /* ignore */ }
        } else {
          // Other errors — log but keep trying next tick.
          // eslint-disable-next-line no-console
          console.warn('Draft autosave failed:', err);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [values, storageKey, enabled, persistDisabled]);

  // ----------------------- multi-tab awareness -------------------------
  useEffect(() => {
    if (!enabled) return undefined;

    const handler = (e) => {
      if (e.key !== storageKey) return;
      if (!e.newValue) return;
      // Ignore the echo from our own write.
      const entry = safeParse(e.newValue);
      if (!entry || entry.savedAt === lastWrittenRef.current) return;
      setHasExternalChange(true);
      try {
        toast.info(
          'Друг таб промени същия черновик — обнови страницата за най-новата версия.',
          { role: 'alert' }
        );
      } catch (err) { /* ignore */ }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey, enabled]);

  // --------------------------- public API ------------------------------
  const restoreDraft = useCallback(() => {
    if (conflictPayloadRef.current) {
      setValues(conflictPayloadRef.current);
    }
    setHasConflict(false);
    conflictPayloadRef.current = null;
  }, [setValues]);

  const discardDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) { /* ignore */ }
    setHasConflict(false);
    conflictPayloadRef.current = null;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) { /* ignore */ }
    setHasConflict(false);
    setHasExternalChange(false);
    conflictPayloadRef.current = null;
  }, [storageKey]);

  return {
    hasConflict,
    restoreDraft,
    discardDraft,
    clearDraft,
    hasExternalChange,
    persistDisabled,
  };
};

export default useArticleDraftPersist;
