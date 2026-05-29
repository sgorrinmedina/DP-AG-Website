import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');

async function getNextIndex(label) {
  let i = 1;
  while (true) {
    const name = label ? `screenshot-${i}-${label}.png` : `screenshot-${i}.png`;
    if (!existsSync(join(screenshotDir, name))) return { i, name };
    i++;
  }
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

if (!existsSync(screenshotDir)) await mkdir(screenshotDir, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

const { name } = await getNextIndex(label);
const outPath = join(screenshotDir, name);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${name}`);
