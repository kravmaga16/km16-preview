import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = pathToFileURL(resolve('index.html')).href;
for (const [name, engine] of [['Chromium', chromium], ['WebKit (Safari engine)', webkit]]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      assert.equal(await page.locator('.profile:visible').count(), 2, name + ': initial cards');
      await page.locator('#search').fill('CAMILLE');
      assert.equal(await page.locator('.profile:visible').count(), 1, name + ': search');
      await page.locator('#search').fill('càmille');
      assert.equal(await page.locator('.profile:visible').count(), 1, name + ': accent-insensitive search');
      await page.locator('#reset').click();
      await page.locator('#status-filter').selectOption('pending');
      assert.equal(await page.locator('.profile:visible').count(), 1, name + ': status filter');
      const card = page.locator('.profile:visible');
      await card.locator('.toggle-details').click();
      assert.equal(await card.locator('details[open]').count(), 2, name + ': expand');
      await card.locator('.toggle-details').click();
      assert.equal(await card.locator('details[open]').count(), 0, name + ': collapse');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, name + ': horizontal overflow');
      assert.deepEqual(errors, [], name + ': runtime errors');
      await page.screenshot({ path: '/tmp/km16-' + name.split(' ')[0].toLowerCase() + '-' + width + '.png', fullPage: true });
      await page.close();
      console.log(name + ' ' + width + 'px: OK');
    }
  } finally {
    await browser.close();
  }
}
