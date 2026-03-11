import { lazy } from 'react';

/**
 * Wraps React.lazy() with automatic page reload on chunk load failure.
 * After a new deploy, old chunk files no longer exist on the server.
 * This catches the import error and reloads once to get the fresh HTML
 * with the correct chunk references.
 */
const lazyWithRetry = (importFn) => {
  return lazy(() =>
    importFn().catch((error) => {
      const storageKey = 'chunk_reload_ts';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Only reload if we haven't reloaded in the last 10 seconds
      // (prevents infinite reload loops)
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }

      throw error;
    })
  );
};

export default lazyWithRetry;
