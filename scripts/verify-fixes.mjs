import fs from 'fs';

const html = fs.readFileSync('out/index.html', 'utf8');

console.log('--- METADATA CHECKS ---');
const hasCanonical = html.includes('href="https://ayahflow.tech/"') && html.includes('rel="canonical"');
console.log('Canonical URL https://ayahflow.tech/:', hasCanonical);

const ogUrl = (html.match(/<meta property="og:url"[^>]+>/) || [])[0];
console.log('og:url tag:', ogUrl);

const ogImg = (html.match(/<meta property="og:image"[^>]+>/) || [])[0];
console.log('og:image tag:', ogImg);

const twCard = (html.match(/<meta name="twitter:card"[^>]+>/) || [])[0];
console.log('twitter:card tag:', twCard);

const twImg = (html.match(/<meta name="twitter:image"[^>]+>/) || [])[0];
console.log('twitter:image tag:', twImg);

console.log('\n--- VIEWPORT CHECK ---');
const vp = (html.match(/<meta name="viewport"[^>]+>/) || [])[0];
console.log('Viewport tag:', vp);
console.log('user-scalable=no is absent:', !html.includes('user-scalable=no') && !html.includes('maximum-scale'));

console.log('\n--- CONTENT CHECKS ---');
console.log('Hero Subtitle matches:', html.includes('Quran recitation with your own ambient soundscape — calming rain, ocean waves and more.'));
console.log('Trust line "Free • No ads • Privacy-friendly analytics":', html.includes('Free • No ads • Privacy-friendly analytics'));
console.log('Installation Guide present:', html.includes('Installation Guide'));
console.log('Play Protect guidance present:', html.includes('Google Play Protect'));

const mixerIdx = html.indexOf('Ambient Soundspace Mixer');
const streakIdx = html.indexOf('Quran Habit Streak');
console.log('Mixer index:', mixerIdx);
console.log('Streak index:', streakIdx);
console.log('Mixer is immediately before Streak:', mixerIdx !== -1 && streakIdx !== -1 && mixerIdx < streakIdx);

console.log('\n--- ASSET & ROUTE CHECKS ---');
console.log('public/og-banner.png exists:', fs.existsSync('public/og-banner.png'));
console.log('out/og-banner.png exists:', fs.existsSync('out/og-banner.png'));
console.log('Obsolete quranify.pro in out/index.html:', html.includes('quranify.pro'));

// Check collections
const collectionsHtml = fs.readFileSync('out/collections/index.html', 'utf8');
const focusMatches = collectionsHtml.match(/Focus &amp; Work|Focus & Work/g) || [];
console.log('Focus & Work occurrences in collections page:', focusMatches.length);
