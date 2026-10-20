import fs from 'fs';

console.log('=== Step 6: Verify Duplicate "Focus & Work" Removal ===\n');

// 1. Inspect src/lib/constants.ts
const constantsCode = fs.readFileSync('src/lib/constants.ts', 'utf8');
const collectionsMatch = constantsCode.match(/export const COLLECTIONS: Collection\[\] = \[([\s\S]*?)\];/);
if (!collectionsMatch) {
  console.error('Could not find COLLECTIONS array in src/lib/constants.ts');
  process.exit(1);
}

const collectionsBlock = collectionsMatch[1];
const titles = Array.from(collectionsBlock.matchAll(/title:\s*"([^"]+)"/g)).map(m => m[1]);
const slugs = Array.from(collectionsBlock.matchAll(/slug:\s*"([^"]+)"/g)).map(m => m[1]);
const ids = Array.from(collectionsBlock.matchAll(/id:\s*"([^"]+)"/g)).map(m => m[1]);

console.log('Collections in src/lib/constants.ts:');
titles.forEach((title, idx) => {
  console.log(`  ${idx + 1}. ID: "${ids[idx]}", Slug: "${slugs[idx]}", Title: "${title}"`);
});

const focusAndWorkMatches = titles.filter(t => t.toLowerCase() === 'focus & work');
console.log(`\nOccurrences of "Focus & Work" in src/lib/constants.ts: ${focusAndWorkMatches.length}`);

// 2. Inspect rendered homepage (.next/server/app/index.html)
const homeHtml = fs.readFileSync('.next/server/app/index.html', 'utf8');
const homeMatches = homeHtml.match(/Focus &amp; Work|Focus & Work/g) || [];
console.log(`Occurrences of "Focus & Work" in rendered homepage HTML: ${homeMatches.length}`);

// 3. Inspect rendered collections page (.next/server/app/collections.html or .next/server/app/collections/index.html)
let collectionsHtml = '';
if (fs.existsSync('.next/server/app/collections.html')) {
  collectionsHtml = fs.readFileSync('.next/server/app/collections.html', 'utf8');
} else if (fs.existsSync('.next/server/app/collections/index.html')) {
  collectionsHtml = fs.readFileSync('.next/server/app/collections/index.html', 'utf8');
}

if (collectionsHtml) {
  const colMatches = collectionsHtml.match(/Focus &amp; Work|Focus & Work/g) || [];
  console.log(`Occurrences of "Focus & Work" in rendered collections page HTML: ${colMatches.length}`);
}

// 4. Check if any duplicate keys or duplicate collections exist
const uniqueTitles = new Set(titles);
const hasDuplicates = uniqueTitles.size !== titles.length;
console.log(`Any duplicate collection titles in constants: ${hasDuplicates ? 'YES (DUPLICATES FOUND)' : 'NO (ALL UNIQUE)'}`);

const pass = focusAndWorkMatches.length === 1 && homeMatches.length === 1 && !hasDuplicates;
console.log(`\nOverall Step 6 Check: ${pass ? 'PASS (EXACTLY ONE COLLECTION)' : 'FAIL'}`);

if (!pass) {
  process.exit(1);
}
