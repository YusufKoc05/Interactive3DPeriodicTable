const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testDarkThemeAndInteractions() {
  console.log('Testing Dark Theme & Dynamic 3D Periodic Table visuals...');
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
  await new Promise((r) => setTimeout(r, 2000));

  const artifactDir = 'C:\\Users\\ykoc0\\.gemini\\antigravity\\brain\\835a0b41-1fb3-4493-a259-aa613955db45';
  
  // 1. Capture Dark Theme Periodic Table overview (showing dark obsidian glass cards + neon edges)
  const overviewScreenshotPath = path.join(artifactDir, 'dark_theme_showcase.png');
  await page.screenshot({ path: overviewScreenshotPath });
  console.log(`Overview Screenshot saved to: ${overviewScreenshotPath}`);

  // 2. Click an element (e.g. Carbon or Titanium) to showcase the dark dynamic detail card and 3D specimen/orbital
  console.log('Searching "Ti" (Titanium) to view dark detail card...');
  const searchInput = await page.$('header input[type="text"]');
  if (searchInput) {
    await searchInput.type('Ti');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 3. Switch to 3D Specimen mode for Titanium
  console.log('Switching to 3D Specimen mode...');
  await page.evaluate(() => {
    const specimenBtn = Array.from(document.querySelectorAll('aside button')).find(
      (b) => b.textContent.includes('3B Numune') || b.textContent.includes('Specimen')
    );
    if (specimenBtn) specimenBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  const detailScreenshotPath = path.join(artifactDir, 'dark_theme_detail_card.png');
  await page.screenshot({ path: detailScreenshotPath });
  console.log(`Detail Card Screenshot saved to: ${detailScreenshotPath}`);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`FAILED: Found ${consoleErrors.length} console errors during browser run.`);
    process.exit(1);
  }

  console.log('PASSED: Dark theme visual verification completed with 0 console errors!');
}

testDarkThemeAndInteractions().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
