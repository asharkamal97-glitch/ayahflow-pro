import fs from 'fs';

console.log('=== Step 7: Viewport Accessibility Verification ===\n');

// 1. Check generated HTML in .next/server/app/index.html
const html = fs.readFileSync('.next/server/app/index.html', 'utf8');

const viewportTags = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/gi) || [];
console.log(`1. Viewport tags found in rendered HTML: ${viewportTags.length}`);
viewportTags.forEach((tag, idx) => console.log(`   Tag ${idx + 1}: ${tag}`));

const noDuplicate = viewportTags.length === 1;
console.log(`   No duplicate viewport tags: ${noDuplicate ? 'PASS' : 'FAIL'}`);

// 2. Check for restrictive attributes
const hasUserScalableNo = html.includes('user-scalable=no') || html.includes('user-scalable="no"');
const hasMaximumScale = html.includes('maximum-scale');

console.log(`2. user-scalable=no is absent: ${!hasUserScalableNo ? 'PASS' : 'FAIL'}`);
console.log(`3. maximum-scale restriction is absent: ${!hasMaximumScale ? 'PASS' : 'FAIL'}`);

// 3. Check for width=device-width and initial-scale=1
const hasWidthDevice = html.includes('width=device-width');
const hasInitialScale = html.includes('initial-scale=1');

console.log(`4. width=device-width present: ${hasWidthDevice ? 'PASS' : 'FAIL'}`);
console.log(`5. initial-scale=1 present: ${hasInitialScale ? 'PASS' : 'FAIL'}`);

// 4. Source code check for userScalable: false in src/app/layout.tsx
const layoutCode = fs.readFileSync('src/app/layout.tsx', 'utf8');
const hasUserScalableInLayout = layoutCode.includes('userScalable: false') || layoutCode.includes('user-scalable=no');
const hasMaxScaleInLayout = layoutCode.includes('maximumScale') || layoutCode.includes('maximum-scale');

console.log(`6. Layout has no restrictive viewport settings: ${!hasUserScalableInLayout && !hasMaxScaleInLayout ? 'PASS' : 'FAIL'}`);

const overallPass = noDuplicate && !hasUserScalableNo && !hasMaximumScale && hasWidthDevice && hasInitialScale && !hasUserScalableInLayout && !hasMaxScaleInLayout;

console.log(`\nOverall Step 7 Check: ${overallPass ? 'ALL CHECKS PASSED' : 'FAILED'}`);

if (!overallPass) {
  process.exit(1);
}
