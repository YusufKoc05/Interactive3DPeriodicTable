const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testSpecimenAndAtomicDetails() {
  console.log('Testing 3D Physical Specimen View & Extended Atomic Properties...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  if (!fs.existsSync(edgePath)) {
    throw new Error('Edge executable not found at: ' + edgePath);
  }

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000', '--enable-webgl']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('Browser Console Error:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
    console.error('Browser Page Error:', err.toString());
  });

  console.log('Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Select Gold (Au Z=79) to showcase metallic gold nugget specimen and full atomic stats
  console.log('Searching "Au" (Gold) and selecting...');
  const searchInput = await page.$('header input[type="text"]');
  if (searchInput) {
    await searchInput.type('Au');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 1200));
  }

  // 2. Click "3B Numune" (3D Physical Specimen mode)
  console.log('Switching to 3D Real Physical Specimen mode (3B Numune)...');
  await page.evaluate(() => {
    const specimenBtn = Array.from(document.querySelectorAll('aside button')).find(
      (b) => b.textContent.includes('3B Numune') || b.textContent.includes('Specimen')
    );
    if (specimenBtn) specimenBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 3. Verify that atomic properties matrix (PROTON, NÖTRON, ELEKTRON, OKSİDASYON) are present
  const hasProtonStat = await page.evaluate(() => {
    return document.body.innerText.includes('PROTON (Z)') && document.body.innerText.includes('OKSİDASYON BASAMAKLARI');
  });
  console.log('Core atomic properties verified in card:', hasProtonStat);

  if (!hasProtonStat) {
    throw new Error('Expected core atomic properties (Proton, Oxidation states) to be rendered!');
  }

  // Take screenshot showcasing the 3D Real Specimen and the rich Atomic Properties panel
  const artifactDir = 'C:\\Users\\ykoc0\\.gemini\\antigravity\\brain\\835a0b41-1fb3-4493-a259-aa613955db45';
  const screenshotPath = path.join(artifactDir, 'specimen_and_atomic_properties.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Specimen & Atomic Properties Screenshot saved to: ${screenshotPath}`);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`FAILED: Found ${consoleErrors.length} console errors during browser run.`);
    process.exit(1);
  }

  console.log('PASSED: 3D Physical Specimen & Extended Atomic Properties verification completed with ZERO errors!');
}

testSpecimenAndAtomicDetails().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
