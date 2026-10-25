import fs from 'fs';
import path from 'path';

function runNativeSeparationTests() {
  console.log('--- RUNNING NATIVE VS WEB SEPARATION TESTS ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  const rootDir = process.cwd();

  // Test 1: usePlatform exists and checks Capacitor.isNativePlatform
  const usePlatformPath = path.join(rootDir, 'src', 'lib', 'usePlatform.ts');
  assert(fs.existsSync(usePlatformPath), 'usePlatform.ts file exists');
  const usePlatformContent = fs.readFileSync(usePlatformPath, 'utf-8');
  assert(
    usePlatformContent.includes('Capacitor.isNativePlatform()'),
    'usePlatform uses Capacitor.isNativePlatform() for native Android detection'
  );
  assert(
    usePlatformContent.includes('platform=android') || usePlatformContent.includes('mode=app'),
    'usePlatform supports browser testing via query params'
  );

  // Test 2: MobileAppHome exists and contains listening UI
  const mobileHomePath = path.join(rootDir, 'src', 'components', 'home', 'MobileAppHome.tsx');
  assert(fs.existsSync(mobileHomePath), 'MobileAppHome.tsx component exists');
  const mobileHomeContent = fs.readFileSync(mobileHomePath, 'utf-8');
  assert(
    mobileHomeContent.includes('Now Playing') || mobileHomeContent.includes('Continue Listening'),
    'MobileAppHome provides immediate Now Playing / Continue Listening context'
  );
  assert(
    mobileHomeContent.includes('Ambient Soundspace'),
    'MobileAppHome includes Ambient Soundspace mixer and quick toggles'
  );
  assert(
    mobileHomeContent.includes('Essential Surahs'),
    'MobileAppHome includes quick essential Surahs with direct 1-tap play'
  );
  assert(
    mobileHomeContent.includes('Reciters'),
    'MobileAppHome includes featured reciters carousel'
  );
  assert(
    !mobileHomeContent.includes('Download APK for Android') &&
      !mobileHomeContent.includes('ApkInstallGuide') &&
      !mobileHomeContent.includes('ScreenshotGallery'),
    'MobileAppHome contains ZERO APK download buttons, install guides, or screenshot galleries'
  );

  // Test 3: Page.tsx conditionally branches to MobileAppHome on native
  const pagePath = path.join(rootDir, 'src', 'app', 'page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  assert(
    pageContent.includes('usePlatform'),
    'src/app/page.tsx imports usePlatform'
  );
  assert(
    pageContent.includes('if (isNative)') && pageContent.includes('<MobileAppHome />'),
    'src/app/page.tsx renders MobileAppHome when isNative is true'
  );
  assert(
    pageContent.includes('ApkInstallGuide') && pageContent.includes('ScreenshotGallery'),
    'src/app/page.tsx preserves rich landing page and APK installation for web visitors'
  );

  // Test 4: MobileNav renders 5 native tabs and suppresses downloads APK on native
  const navPath = path.join(rootDir, 'src', 'components', 'layout', 'MobileNav.tsx');
  const navContent = fs.readFileSync(navPath, 'utf-8');
  assert(
    navContent.includes('usePlatform'),
    'MobileNav.tsx imports usePlatform'
  );
  const startIdx = navContent.indexOf('nativeNavItems');
  const nativeBlock = navContent.slice(startIdx, navContent.indexOf('];', startIdx));
  assert(
    startIdx !== -1 && nativeBlock.length > 0 && !nativeBlock.includes('/downloads'),
    'MobileNav native items contain NO /downloads APK link'
  );
  assert(
    navContent.includes('setAmbientModalOpen'),
    'MobileNav allows instant 1-tap access to Ambient Soundspace mixer'
  );

  // Test 5: DownloadsPage hides APK installer when on native Android
  const downloadsPath = path.join(rootDir, 'src', 'app', 'downloads', 'page.tsx');
  const downloadsContent = fs.readFileSync(downloadsPath, 'utf-8');
  assert(
    downloadsContent.includes('!isNative'),
    'DownloadsPage conditionally hides APK download box and guides on native Android'
  );

  // Test 6: Sidebar is suppressed on native Android
  const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  assert(
    sidebarContent.includes('if (isNative) return null;'),
    'Sidebar is cleanly suppressed on native Android devices'
  );

  console.log(`\nRESULTS: ${passed}/${total} separation tests passed.\n`);
}

runNativeSeparationTests();
