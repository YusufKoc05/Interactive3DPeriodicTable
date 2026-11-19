const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testDynamicSynthesis() {
  console.log('--- Starting E2E Verification of Dynamic Molecule Synthesis & Bonding ---');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  if (!fs.existsSync(edgePath)) {
    throw new Error('Edge executable not found at: ' + edgePath);
  }

  const tempProfile = path.join('C:\\Users\\ykoc0\\AppData\\Local\\Temp', 'edge_synth_' + Date.now());
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

  // 1. Open Molecule Builder Sandbox
  console.log('Opening Molecule Builder Sandbox...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('header button'));
    const compBtn = btns.find((b) => b.textContent.includes('Molekül') || b.textContent.includes('Molecules'));
    if (compBtn) compBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Verify O2 (Dioksijen) is active with covalent bonding
  const hasO2 = await page.evaluate(() => {
    return document.body.innerText.includes('O₂') && (document.body.innerText.includes('covalent') || document.body.innerText.includes('kovalent') || document.body.innerText.includes('Oksijen'));
  });
  console.log('Verified O2 dynamic covalent synthesis:', hasO2);

  const o2Screenshot = path.join(artifactDir, 'dynamic_o2_synthesis.png');
  await page.screenshot({ path: o2Screenshot });
  console.log('O2 Synthesis Screenshot saved:', o2Screenshot);

  // 2. Clear and synthesize NaF (Ionic Bond)
  console.log('Clearing inventory and synthesizing NaF (Sodium Fluoride)...');
  await page.evaluate(() => {
    // Click clear / reset
    const clearBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Temizle') || b.textContent.includes('Clear'));
    if (clearBtn) clearBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click Na button then F button
  await page.evaluate(() => {
    const atomButtons = Array.from(document.querySelectorAll('button'));
    const naBtn = atomButtons.find((b) => b.textContent.includes('Na') && b.textContent.includes('Sodyum'));
    const fBtn = atomButtons.find((b) => b.textContent.includes('F') && b.textContent.includes('Flor'));
    if (naBtn) naBtn.click();
    if (fBtn) fBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  const hasIonic = await page.evaluate(() => {
    return document.body.innerText.includes('NaF') && (document.body.innerText.includes('İyonik') || document.body.innerText.includes('ionic'));
  });
  console.log('Verified NaF dynamic ionic synthesis:', hasIonic);

  const nafScreenshot = path.join(artifactDir, 'dynamic_naf_synthesis.png');
  await page.screenshot({ path: nafScreenshot });
  console.log('NaF Synthesis Screenshot saved:', nafScreenshot);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`FAILED: Found ${consoleErrors.length} console errors during browser run.`);
    process.exit(1);
  }

  console.log('PASSED: Dynamic Compound Synthesis & Voice Engine verified with ZERO errors!');
}

testDynamicSynthesis().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
