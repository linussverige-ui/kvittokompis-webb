/* Responsive browser acceptance: public static page only, no Render visits. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const url = pathToFileURL(path.resolve('index.html')).href;
  const screenshots = path.resolve('ux-v2-screenshots');
  fs.mkdirSync(screenshots, {recursive: true});
  const browser = await chromium.launch({headless: true});
  try {
    for (const width of [320, 360, 390, 430, 550, 768, 800, 1024, 1280, 1440]) {
      const page = await browser.newPage({viewport: {width, height: 900}, deviceScaleFactor: 1});
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(url, {waitUntil: 'load'});
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.landing-feature').count(), 4);
      assert.equal(await page.locator('.landing-industry').count(), 2);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        width: window.innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        iconsLoaded: [...document.querySelectorAll('img')].every(img => img.complete && img.naturalWidth > 0),
        navScriptLoaded: !!document.querySelector('script[src="./navigation.js"]')
      }));
      assert.ok(metrics.scrollWidth <= metrics.width + 1,
        'Horizontal overflow at '+width+'px: '+JSON.stringify(metrics));
      assert.ok(metrics.iconsLoaded, 'Icon did not load at '+width+'px');
      assert.ok(metrics.navScriptLoaded, 'Navigation JavaScript missing at '+width+'px');
      assert.deepEqual(errors, [], 'JavaScript error at '+width+'px');
      for (const id of ['sa-funkar-det', 'funktioner', 'branscher', 'planer', 'installera', 'fragor']) {
        assert.equal(await page.locator('#'+id).count(),1, 'Missing '+id);
      }
      assert.ok(await page.locator('a[href="https://kvittokompis-test-2q67.onrender.com/login"]').count() >= 2);

      const install = page.locator('.landing-install-card').first();
      await install.locator('summary').click();
      assert.ok(await install.evaluate(el => el.open), 'Android install guide did not open');
      await install.locator('summary').click();
      assert.ok(!(await install.evaluate(el => el.open)), 'Android install guide did not close');

      if (width <= 800) {
        const menu = page.locator('.landing-mobile-nav');
        assert.equal(await menu.isVisible(), true, 'Mobile menu missing');
        assert.equal(await page.locator('.landing-header__app').isVisible(), true, 'Direct app CTA missing');
        await menu.locator('summary').click();
        assert.ok(await menu.evaluate(el => el.open), 'Menu failed to open');
        await menu.locator('a[href="#installera"]').click();
        assert.equal(new URL(page.url()).hash, '#installera', 'Mobile install anchor failed');
        assert.ok(!(await menu.evaluate(el => el.open)), 'Menu did not close after navigation');
        await menu.locator('summary').click();
        await page.keyboard.press('Escape');
        assert.ok(!(await menu.evaluate(el => el.open)), 'Escape did not close menu');
        await menu.locator('summary').click();
        // Click safely outside the popup. A sticky header can cover the h1 after anchor navigation.
        await page.mouse.click(14, 450);
        assert.ok(!(await menu.evaluate(el => el.open)), 'Outside click did not close menu');
        const hitSizes = await page.evaluate(() => ({
          menu: document.querySelector('.landing-mobile-nav summary').getBoundingClientRect().height,
          primary: document.querySelector('.landing-hero__actions .landing-button--primary').getBoundingClientRect().height
        }));
        assert.ok(hitSizes.menu >= 44 && hitSizes.primary >= 44,
          'Tiny mobile tap target '+width+'px: '+JSON.stringify(hitSizes));
      } else {
        assert.equal(await page.locator('.landing-nav').isVisible(),true,'Desktop navigation missing');
        assert.equal(await page.locator('.landing-header__app').isVisible(),false,'Mobile CTA visible on desktop');
      }
      await page.locator('.landing-faq details').first().locator('summary').click();
      assert.ok(await page.locator('.landing-faq details').first().evaluate(el => el.open), 'FAQ failed');
      // Screenshot the real default state, not the artificially expanded test state.
      await page.locator('.landing-faq details').first().locator('summary').click();
      assert.ok(!(await page.locator('.landing-faq details').first().evaluate(el => el.open)));
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({path: path.join(screenshots,'kvitto-kompis-'+width+'px.png'),fullPage:true});
      console.log('PASS '+width+'px, height='+metrics.pageHeight+'px, no overflow, menu and FAQ work');
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(e => {console.error(e);process.exit(1)});
