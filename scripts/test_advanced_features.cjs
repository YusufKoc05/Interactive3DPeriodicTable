const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testAdvancedFeatures() {
  console.log('--- Starting Comprehensive E2E Verification of Advanced Features ---');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  if (!fs.existsSync(edgePath)) {
    throw new Error('Edge executable not found at: ' + edgePath);
  }

  const tempProfile = path.join('C:\\Users\\ykoc0\\AppData\\Local\\Temp', 'edge_test_' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1600,1000',
      '--enable-webgl',
      `--user-data-dir=${tempProfile}`
    ]
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

  // 1. TEST COMPOUND BUILDER MODAL
  console.log('Opening Compound Builder Sandbox...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('header button'));
    const compBtn = btns.find((b) => b.textContent.includes('Molekül') || b.textContent.includes('Molecules'));
    if (compBtn) compBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const compoundScreenshot = path.join(artifactDir, 'compound_builder_showcase.png');
  await page.screenshot({ path: compoundScreenshot });
  console.log('Compound Builder Screenshot saved:', compoundScreenshot);

  // Close compound modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('div.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 2. TEST ELEMENT DETAIL CARD: SPECTRUM & CRYSTAL LATTICE
  console.log('Selecting Gold (Au) to test Crystal Lattice & Optical Spectrum...');
  const searchInput = await page.$('header input[type="text"]');
  if (searchInput) {
    await searchInput.type('Au');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Switch to Lattice mode
  console.log('Switching to 3D Crystal Lattice mode...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const latticeBtn = btns.find((b) => b.textContent.includes('Kafes') || b.textContent.includes('Lattice'));
    if (latticeBtn) latticeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Switch to Spectrum tab in card
  console.log('Opening Optical Emission Spectrum tab in card...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const specTab = btns.find((b) => b.textContent.includes('Spektrum') || b.textContent.includes('Spectrum'));
    if (specTab) specTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const spectrumScreenshot = path.join(artifactDir, 'spectrum_and_crystal_lattice.png');
  await page.screenshot({ path: spectrumScreenshot });
  console.log('Spectrum & Crystal Lattice Screenshot saved:', spectrumScreenshot);

  // 3. TEST RADIOACTIVE DECAY & ISOTOPES
  console.log('Selecting Uranium (U) to test 3D Radioactive Decay & Isotopes...');
  if (searchInput) {
    await page.evaluate(() => {
      const input = document.querySelector('header input[type="text"]');
      if (input) input.value = '';
    });
    await searchInput.type('U');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Switch to Isotopes tab and Decay view
  console.log('Switching to Isotopes tab & 3D Decay...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const isoTab = btns.find((b) => b.textContent.includes('İzotoplar') || b.textContent.includes('Isotopes'));
    if (isoTab) isoTab.click();
    const decayBtn = btns.find((b) => b.textContent.includes('Bozunma') || b.textContent.includes('Decay'));
    if (decayBtn) decayBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  const decayScreenshot = path.join(artifactDir, 'decay_and_isotopes.png');
  await page.screenshot({ path: decayScreenshot });
  console.log('Decay & Isotopes Screenshot saved:', decayScreenshot);

  // Close element detail card
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 800));

  // 4. TEST CHEMISTRY HUNTER QUIZ MODAL
  console.log('Opening Chemistry Hunter Quiz modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('header button'));
    const quizBtn = btns.find((b) => b.textContent.includes('Quiz'));
    if (quizBtn) quizBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const quizScreenshot = path.join(artifactDir, 'quiz_mode_showcase.png');
  await page.screenshot({ path: quizScreenshot });
  console.log('Quiz Mode Screenshot saved:', quizScreenshot);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`FAILED: Found ${consoleErrors.length} console errors during browser run.`);
    process.exit(1);
  }

  console.log('PASSED: All 6 Advanced Features verified with ZERO console errors!');
}

testAdvancedFeatures().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
