// server/scripts/backfillResizeImages.js
//
// Re-triggers the Firebase Resize Images extension for existing files in
// Cloud Storage. The extension only listens for `object.finalize` events
// (new uploads), so pre-existing images never get resized. This script
// downloads each image and re-uploads it under the same name — that upload
// is treated as a new finalize event and the extension picks it up.
//
// Usage:
//   # Process ALL images in the bucket (skip already-resized)
//   node scripts/backfillResizeImages.js
//
//   # Process only a specific folder (prefix)
//   node scripts/backfillResizeImages.js articles/
//
//   # Multiple folders, comma-separated
//   node scripts/backfillResizeImages.js "articles/,initiatives/,clubs/"
//
// Prints progress every file. Safe to re-run — already-resized files are skipped.

require('dotenv').config();

const { initializeFirebaseAdmin, admin } = require('../src/firebase/firebaseAdmin');

// Bucket name (default project bucket)
const BUCKET_NAME = 'pensaclub-909e0.appspot.com';

// How many files to process in parallel. Lower = slower but gentler on
// Cloud Function quota; higher = faster but risks rate limits.
const CONCURRENCY = 5;

// Filename pattern for resized outputs (skip these — they're already processed).
// Matches e.g. "image_600x600.webp", "image_200x200.jpeg".
const RESIZED_PATTERN = /_\d+x\d+\.(webp|jpe?g|png|tiff|gif)$/i;

// Image MIME types the extension can process.
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
  'image/gif',
];

async function processFile(file) {
  const name = file.name;

  // Fetch metadata first — need contentType to know if it's an image
  const [metadata] = await file.getMetadata();
  const contentType = metadata.contentType || '';

  if (!SUPPORTED_MIME_TYPES.includes(contentType)) {
    return { skipped: true, reason: `unsupported type: ${contentType}` };
  }

  if (RESIZED_PATTERN.test(name)) {
    return { skipped: true, reason: 'already resized' };
  }

  // Download file content and re-upload. The save() call generates a new
  // `object.finalize` event that the resize extension listens for.
  const [buffer] = await file.download();
  await file.save(buffer, {
    contentType,
    metadata: {
      ...metadata.metadata,
      backfilledAt: new Date().toISOString(),
    },
    resumable: false, // simple one-shot upload for small files
  });

  return { processed: true, size: buffer.length };
}

async function backfill(prefixes) {
  initializeFirebaseAdmin();
  const bucket = admin.storage().bucket(BUCKET_NAME);

  const allFiles = [];
  for (const prefix of prefixes) {
    console.log(`\nListing files under prefix: "${prefix || '(entire bucket)'}"`);
    const [files] = await bucket.getFiles({ prefix: prefix || undefined });
    allFiles.push(...files);
  }

  console.log(`Total files found: ${allFiles.length}`);
  console.log(`Starting backfill with concurrency=${CONCURRENCY}\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let idx = 0;

  // Simple concurrency pool: start CONCURRENCY workers, each picks next file
  async function worker(workerId) {
    while (idx < allFiles.length) {
      const current = idx++;
      const file = allFiles[current];
      const progress = `[${current + 1}/${allFiles.length}]`;

      try {
        const result = await processFile(file);
        if (result.processed) {
          processed++;
          console.log(`${progress} ✔ ${file.name} (${(result.size / 1024).toFixed(1)} KB)`);
        } else {
          skipped++;
          console.log(`${progress} ⊘ ${file.name} — ${result.reason}`);
        }
      } catch (err) {
        errors++;
        console.error(`${progress} ✗ ${file.name} — ${err.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => worker(i))
  );

  console.log(`\n======================`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Errors:    ${errors}`);
  console.log(`======================`);
  console.log(`\nNote: resize happens asynchronously in Cloud Functions.`);
  console.log(`Wait ~${Math.ceil(processed * 5 / 60)} minutes then check Storage for _NNNxNNN.webp variants.`);
}

(async () => {
  try {
    const arg = process.argv[2] || '';
    const prefixes = arg
      ? arg.split(',').map((p) => p.trim()).filter(Boolean)
      : [''];

    await backfill(prefixes);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Backfill failed:', err);
    process.exit(1);
  }
})();
