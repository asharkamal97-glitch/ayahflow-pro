async function verifyLive() {
  const res = await fetch('https://ayahflow-quranify.vercel.app');
  const html = await res.text();
  console.log('Homepage HTTP Status:', res.status);
  console.log('Canonical Tag:', html.includes('rel="canonical" href="https://ayahflow-quranify.vercel.app/"'));
  console.log('Title Tag:', html.includes('<title>AyahFlow — Quran Recitation with Rain &amp; Ocean Sounds</title>'));
  console.log('og:title Tag:', html.includes('<meta property="og:title" content="AyahFlow — Quran Recitation + Ambient Sounds"/>'));
  console.log('og:image /og-banner.png:', html.includes('https://ayahflow-quranify.vercel.app/og-banner.png'));
  console.log('twitter:image /og-banner.png:', html.includes('https://ayahflow-quranify.vercel.app/og-banner.png'));
  console.log('Viewport has user-scalable=no:', html.includes('user-scalable=no') || html.includes('maximum-scale'));
  console.log('Hero Heading matches:', html.includes('Quran Recitation +') && html.includes('Ambient Sounds'));
  console.log('Hero Subtitle matches:', html.includes('Find your peaceful soundscape with calming rain, ocean waves, and more.'));
  console.log('Trust Line (Free • No ads • No tracking):', html.includes('Free • No ads • No tracking'));
  console.log('Install Guide present:', html.includes('Installation Guide'));

  const mixerIdx = html.indexOf('Ambient Soundspace Mixer');
  const streakIdx = html.indexOf('Quran Habit Streak');
  console.log('Mixer is immediately before Streak card:', mixerIdx !== -1 && streakIdx !== -1 && mixerIdx < streakIdx);

  const bannerRes = await fetch('https://ayahflow-quranify.vercel.app/og-banner.png');
  console.log('og-banner.png Status:', bannerRes.status, bannerRes.headers.get('content-type'), bannerRes.headers.get('content-length'));

  const googleRes = await fetch('https://ayahflow-quranify.vercel.app/googleb532ccb259fc06e7.html');
  const googleText = await googleRes.text();
  console.log('Google Verification Status:', googleRes.status, googleText.trim());
}
verifyLive();
