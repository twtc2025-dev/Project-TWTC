const puppeteer = require('puppeteer');

(async () => {
  const logs = [];
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = `${msg.type().toUpperCase()}: ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });

  try {
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2', timeout: 30000 });
    // wait a bit for ads script to run and push
    await page.waitForTimeout(4000);

    const hasAdsby = await page.evaluate(() => !!(window.adsbygoogle && Array.isArray(window.adsbygoogle)));
    const insCount = await page.evaluate(() => document.querySelectorAll('ins.adsbygoogle').length);

    console.log('\nRESULTS:');
    console.log('ins.adsbygoogle count =', insCount);
    console.log('window.adsbygoogle present =', hasAdsby);

    const errors = logs.filter(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('adsbygoogle'));
    if (insCount > 0 && hasAdsby) {
      console.log('Ad container present and adsbygoogle array exists.');
      await browser.close();
      process.exit(0);
    }

    console.log('Some diagnostics logs:');
    errors.forEach(e => console.log(e));
    await browser.close();
    process.exit(2);
  } catch (err) {
    console.error('Check failed:', err);
    await browser.close();
    process.exit(3);
  }
})();
