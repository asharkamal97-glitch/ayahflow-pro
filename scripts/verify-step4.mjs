import fs from 'fs';

const html = fs.readFileSync('.next/server/app/index.html', 'utf8');

console.log('=== Step 4 Hierarchy & Content Verification ===');

// Check 1: Hero heading
const hasHeading = html.includes('Quran Recitation +') && html.includes('Ambient Sounds');
console.log(`1. Hero Heading 'Quran Recitation + Ambient Sounds': ${hasHeading ? 'PASS' : 'FAIL'}`);

// Check 2: Subtitle
const hasSubtitle = html.includes('Find your peaceful soundscape with calming rain, ocean waves, and more.');
console.log(`2. Hero Subtitle: ${hasSubtitle ? 'PASS' : 'FAIL'}`);

// Check 3: Ambient Soundspace Mixer position vs Download CTA and Streak
const ambientMixerIndex = html.indexOf('Ambient Soundspace Mixer');
const downloadCtaIndex = html.indexOf('Download for Android (APK)');
const streakCardIndex = html.indexOf('Quran Habit Streak!');

console.log(`3. Order verification:`);
console.log(`   - Ambient Soundspace Mixer index: ${ambientMixerIndex}`);
console.log(`   - Download CTA index: ${downloadCtaIndex}`);
console.log(`   - Streak Card index: ${streakCardIndex}`);

const orderValid = (ambientMixerIndex !== -1) && 
                   (downloadCtaIndex > ambientMixerIndex) && 
                   (streakCardIndex > downloadCtaIndex);

console.log(`   Order (Mixer -> Download CTA -> Streak Card): ${orderValid ? 'PASS' : 'FAIL'}`);

// Check 4: Ambient sounds present
const sounds = [
  'Calm Rain',
  'Gentle Bonfire',
  'Calm River',
  'Morning Birds',
  'Light Wind',
  'Ocean Waves',
  'Cat Purring',
  'Thunder &amp; Rain', // or Thunder & Rain
  'Thunderbolt'
];

let allSoundsPresent = true;
sounds.forEach(sound => {
  const present = html.includes(sound) || html.includes(sound.replace('&amp;', '&'));
  if (!present) {
    console.log(`   Missing sound: ${sound}`);
    allSoundsPresent = false;
  }
});
console.log(`4. All 9 Ambient Sounds Present in Mixer: ${allSoundsPresent ? 'PASS' : 'FAIL'}`);

// Check 5: Audio controls present
const hasFineTune = html.includes('Fine-tune Mix');
const hasVolumeInput = html.includes('type="range"');
console.log(`5. Ambient Mixer Controls (Fine-tune Mix, Volume Range): ${hasFineTune && hasVolumeInput ? 'PASS' : 'FAIL'}`);

if (hasHeading && hasSubtitle && orderValid && allSoundsPresent && hasFineTune && hasVolumeInput) {
  console.log('\n>>> ALL STEP 4 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<');
  process.exit(0);
} else {
  console.error('\n>>> SOME STEP 4 VERIFICATION CHECKS FAILED! <<<');
  process.exit(1);
}
