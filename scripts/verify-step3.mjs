import fs from 'fs';

const html = fs.readFileSync('out/index.html', 'utf8');

console.log('=== STEP 3: TITLE & DESCRIPTION VERIFICATION ===');

// Title tag
const titleMatches = html.match(/<title[^>]*>([^<]+)<\/title>/g) || [];
console.log('Title tags found:        ', titleMatches.length);
console.log('Rendered <title>:        ', titleMatches[0] || 'NOT FOUND');

// Meta description
const descMatches = html.match(/<meta name="description"[^>]+>/g) || [];
console.log('\nDescription tags found:  ', descMatches.length);
console.log('Rendered description:    ', descMatches[0] || 'NOT FOUND');

// Open Graph Title & Description
const ogTitleMatches = html.match(/<meta property="og:title"[^>]+>/g) || [];
const ogDescMatches = html.match(/<meta property="og:description"[^>]+>/g) || [];
console.log('\nog:title tags found:     ', ogTitleMatches.length);
console.log('Rendered og:title:       ', ogTitleMatches[0] || 'NOT FOUND');
console.log('og:description found:    ', ogDescMatches.length);
console.log('Rendered og:description: ', ogDescMatches[0] || 'NOT FOUND');

// Twitter Title & Description
const twTitleMatches = html.match(/<meta name="twitter:title"[^>]+>/g) || [];
const twDescMatches = html.match(/<meta name="twitter:description"[^>]+>/g) || [];
console.log('\ntwitter:title tags found:', twTitleMatches.length);
console.log('Rendered twitter:title:  ', twTitleMatches[0] || 'NOT FOUND');
console.log('twitter:description:     ', twDescMatches.length);
console.log('Rendered tw:description: ', twDescMatches[0] || 'NOT FOUND');

// Preservation checks: og:url, og:image
const ogUrlMatches = html.match(/<meta property="og:url"[^>]+>/g) || [];
const ogImgMatches = html.match(/<meta property="og:image"[^>]+>/g) || [];
console.log('\n=== PRESERVED METADATA ===');
console.log('Preserved og:url:        ', ogUrlMatches[0] || 'NOT FOUND');
console.log('Preserved og:image:      ', ogImgMatches[0] || 'NOT FOUND');

// Duplicates check
console.log('\n=== DUPLICATE AUDIT ===');
console.log('Duplicate <title>?        ', titleMatches.length > 1);
console.log('Duplicate description?   ', descMatches.length > 1);
console.log('Duplicate og:title?      ', ogTitleMatches.length > 1);
console.log('Duplicate og:description?', ogDescMatches.length > 1);
console.log('Duplicate twitter:title? ', twTitleMatches.length > 1);
console.log('Duplicate tw:description?', twDescMatches.length > 1);
