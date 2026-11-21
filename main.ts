// gta6-meme-x-01: hand in the X post's address.
//
// The gate reads POST.json out of /output, so this program copies the
// repository's POST.json there. That is all it does: no network, no wall
// clock, no files outside the repository, so the two runs of an entry
// always write the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(botDir, 'POST.json');
if (!existsSync(source)) {
  console.error(`error: no POST.json in ${botDir} — the post's address is missing`);
  process.exit(1);
}

// Read it first: a POST.json that is not a JSON object with a string url
// is no post's address, and the gate would refuse it. Fail here, with the
// reason, instead of copying a useless file. A placeholder address is
// still valid JSON, so it only earns a warning — the copy goes ahead.
let post: unknown;
try {
  post = JSON.parse(readFileSync(source, 'utf8'));
} catch (err) {
  console.error(`error: POST.json in ${botDir} is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof post !== 'object' || post === null || typeof (post as { url?: unknown }).url !== 'string') {
  console.error(`error: POST.json in ${botDir} has no string "url" — it names no post`);
  process.exit(1);
}
const url = (post as { url: string }).url;
if (url.includes('<handle>') || url.includes('<id>')) {
  console.error('warning: POST.json still holds the placeholder address — replace it with the real post URL before submitting');
}

mkdirSync(outputDir, { recursive: true });
try {
  copyFileSync(source, join(outputDir, 'POST.json'));
} catch (err) {
  console.error(`error: could not copy POST.json to ${outputDir}: ${(err as Error).message}`);
  process.exit(1);
}
