// client/src/utils/firebaseImageResize.js
//
// Helpers for using resized WebP variants produced by the Firebase
// Resize Images extension.
//
// Extension config (see Firebase console → Extensions → Resize Images):
//   - Sizes generated: 200x200, 600x600, 1200x1200
//   - Output format: webp
//   - Files are written alongside the original in the same folder, named
//     `<original-basename>_<WxH>.webp`.
//
// These helpers are designed to be safe: if an input doesn't look like a
// Firebase Storage URL, or the extension hasn't produced a resized variant
// yet (e.g., just-uploaded file), the helpers return the original URL so
// the caller never ends up with a broken image.

/** Sizes the resize extension generates. Keep in sync with extension config. */
export const AVAILABLE_RESIZED_SIZES = [200, 600, 1200];

/**
 * Build the URL for a resized WebP variant of a Firebase Storage image.
 *
 * Example:
 *   getResizedUrl(
 *     'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/articles%2Fabc-cover.jpg?alt=media&token=xyz',
 *     600
 *   )
 *   →
 *   'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/articles%2Fabc-cover_600x600.webp?alt=media&token=xyz'
 *
 * @param {string} originalUrl  Firebase Storage download URL
 * @param {number} size         One of AVAILABLE_RESIZED_SIZES. Defaults to 600.
 * @returns {string}            Resized URL, or originalUrl on any failure.
 */
export function getResizedUrl(originalUrl, size = 600) {
  // Sanity checks — never throw, always return something renderable.
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;
  if (!originalUrl.includes('firebasestorage.googleapis.com')) return originalUrl;
  if (!AVAILABLE_RESIZED_SIZES.includes(size)) return originalUrl;

  try {
    const url = new URL(originalUrl);

    // Firebase Storage URL shape:
    //   /v0/b/<BUCKET>/o/<URL_ENCODED_PATH>
    //
    // The Resize extension follows the ORIGINAL filename's convention for
    // the output name. On pensa.club we have two upload styles:
    //
    //   Original with extension:    "cover.jpg"
    //     → Output: "cover_600x600.webp"
    //
    //   Original without extension: "<UUID>" (MIME type lives in metadata)
    //     → Output: "<UUID>_600x600"   ← NO ".webp" suffix, just MIME-only
    //
    // We must match this convention to hit the resized file, otherwise the
    // fetch returns 404 and we fall back to the original (large) image.
    const pathMatch = url.pathname.match(/^(.+)(\.[^./]+)$/);
    if (pathMatch) {
      // Original had an extension — replace it with _SIZExSIZE.webp.
      url.pathname = `${pathMatch[1]}_${size}x${size}.webp`;
    } else {
      // Extension-less original — the resized sibling is also extension-less.
      url.pathname = `${url.pathname}_${size}x${size}`;
    }

    // Keep all original search params (alt=media, token, etc.) — Firebase
    // download tokens work across same-folder siblings in practice.
    return url.toString();
  } catch {
    return originalUrl;
  }
}

/**
 * Preload a resized URL and resolve to it only if the image actually loads.
 * Useful for CSS `background-image`, where there's no native onError.
 *
 * Usage (in a React component):
 *   const [bg, setBg] = useState(original);
 *   useEffect(() => {
 *     resolveResizedOrFallback(original, 1200).then(setBg);
 *   }, [original]);
 *   // <div style={{ backgroundImage: `url("${bg}")` }} />
 *
 * @param {string} originalUrl
 * @param {number} size
 * @returns {Promise<string>}   Resized URL if it loads, otherwise originalUrl.
 */
export function resolveResizedOrFallback(originalUrl, size = 600) {
  const resized = getResizedUrl(originalUrl, size);
  if (resized === originalUrl) return Promise.resolve(originalUrl);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(resized);
    img.onerror = () => resolve(originalUrl);
    img.src = resized;
  });
}
