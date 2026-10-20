import fs from 'fs';

console.log('=== AYAHFLOW FAVICON VERIFICATION ===\n');

// 1. Check icon.png exists in src/app/
const iconPath = 'src/app/icon.png';
const iconExists = fs.existsSync(iconPath);
console.log(`1. src/app/icon.png exists: ${iconExists ? 'PASS' : 'FAIL'}`);
if (iconExists) {
  const stats = fs.statSync(iconPath);
  console.log(`   File size: ${stats.size} bytes`);
  const buf = fs.readFileSync(iconPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  console.log(`   Resolution: ${width}x${height}`);
}

// 2. Check conflicting src/app/favicon.ico is removed
const oldFaviconExists = fs.existsSync('src/app/favicon.ico');
console.log(`2. Default Next.js favicon.ico removed from src/app/: ${!oldFaviconExists ? 'PASS' : 'FAIL'}`);

// 3. Check rendered HTML
const html = fs.readFileSync('.next/server/app/index.html', 'utf8');
const iconLinks = html.match(/<link[^>]+icon[^>]+>/gi) || [];
console.log(`3. Rendered icon link tags in HTML: ${iconLinks.length}`);
iconLinks.forEach((link, idx) => console.log(`   Tag ${idx + 1}: ${link}`));

const hasIconPngLink = iconLinks.some(link => link.includes('icon.png') && link.includes('image/png'));
const hasOldFaviconLink = iconLinks.some(link => link.includes('favicon.ico'));

console.log(`4. Generated HTML links to /icon.png: ${hasIconPngLink ? 'PASS' : 'FAIL'}`);
console.log(`5. Generated HTML has no old favicon.ico link: ${!hasOldFaviconLink ? 'PASS' : 'FAIL'}`);

// 6. Check preservation of existing metadata
const hasTitle = html.includes('AyahFlow — Quran Recitation with Rain &amp; Ocean Sounds');
const hasOgTitle = html.includes('AyahFlow — Quran Recitation + Ambient Sounds');
const hasOgImage = html.includes('https://ayahflow-quranify.vercel.app/og-banner.png');
const hasCanonical = html.includes('https://ayahflow-quranify.vercel.app/');

console.log(`6. Preserved Page Title: ${hasTitle ? 'PASS' : 'FAIL'}`);
console.log(`7. Preserved Open Graph Title: ${hasOgTitle ? 'PASS' : 'FAIL'}`);
console.log(`8. Preserved Open Graph Image: ${hasOgImage ? 'PASS' : 'FAIL'}`);
console.log(`9. Preserved Canonical URL: ${hasCanonical ? 'PASS' : 'FAIL'}`);

const allPassed = iconExists && !oldFaviconExists && hasIconPngLink && !hasOldFaviconLink && hasTitle && hasOgTitle && hasOgImage && hasCanonical;

console.log(`\nOVERALL VERIFICATION: ${allPassed ? 'ALL CHECKS PASSED' : 'FAIL'}`);

if (!allPassed) {
  process.exit(1);
}
