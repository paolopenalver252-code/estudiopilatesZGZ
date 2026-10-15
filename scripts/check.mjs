// Verificación automática de la demo con Playwright (usa el Chrome/Edge instalado).
// Requiere el servidor local en marcha:  npm run dev   (otra terminal)  y luego:  npm run check
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4747/';
const OUT = 'screenshots';
const executablePath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => fs.existsSync(p));

const viewports = [
  { name: '320', width: 320, height: 640, mobile: true },
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1366', width: 1366, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath });
const results = [];
let failures = 0;
const check = (label, ok, detail = '') => {
  results.push(`${ok ? 'OK  ' : 'FALLO'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Fuerza la carga de imágenes diferidas y el revelado, para capturas completas
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
  await page.waitForLoadState('networkidle');

  const m = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImgs: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
    smallTargets: [...document.querySelectorAll('a, button, summary, .chip span')]
      .filter((el) => el.offsetParent !== null && !el.closest('.site-footer__contact, p, dd, .form__privacy'))
      .map((el) => ({ t: (el.textContent || '').trim().slice(0, 30), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h > 0 && x.h < 44),
    h1: document.querySelectorAll('h1').length,
  }));
  check(`[${vp.name}] sin desplazamiento horizontal`, m.overflow <= 0, m.overflow > 0 ? `${m.overflow}px` : '');
  check(`[${vp.name}] imágenes cargadas`, m.brokenImgs.length === 0, m.brokenImgs.join(', '));
  check(`[${vp.name}] objetivos táctiles ≥ 44px`, m.smallTargets.length === 0, JSON.stringify(m.smallTargets));
  check(`[${vp.name}] un único H1`, m.h1 === 1);

  if (vp.width < 960) {
    // Menú móvil: abrir, comprobar foco, cerrar con Escape
    await page.click('[data-menu-toggle]');
    const menu = await page.evaluate(() => ({
      expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'),
      visible: getComputedStyle(document.querySelector('[data-menu]')).visibility,
      focus: document.activeElement.textContent.trim(),
    }));
    check(`[${vp.name}] menú móvil se abre`, menu.expanded === 'true' && menu.visible === 'visible' && menu.focus === 'El método', JSON.stringify(menu));
    await page.screenshot({ path: `${OUT}/${vp.name}-menu.png` });
    await page.click('.nav__list a[href="#contacto"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({
      open: document.querySelector('[data-menu]').classList.contains('is-open'),
      top: Math.round(document.querySelector('#contacto').getBoundingClientRect().top),
    }));
    check(`[${vp.name}] enlace del menú cierra y navega`, !after.open && after.top < 120 && after.top >= 0, JSON.stringify(after));
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  await page.screenshot({ path: `${OUT}/${vp.name}-inicio.png` });
  await page.addStyleTag({ content: '.mobile-bar{display:none!important}' });
  await page.screenshot({ path: `${OUT}/${vp.name}-completa.png`, fullPage: true });

  check(`[${vp.name}] sin errores de consola`, errors.length === 0, errors.join(' | '));
  check(`[${vp.name}] sin peticiones fallidas`, failed.length === 0, failed.join(' | '));
  await ctx.close();
}

// Formulario: validación y mensaje generado
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}#contacto`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await page.click('[data-contact-form] button[type="submit"]');
  const invalid = await page.evaluate(() => ({
    errors: !document.querySelector('[data-form-errors]').hidden,
    focus: document.activeElement.id,
    opened: window.__opened.length,
  }));
  check('[form] bloquea el envío vacío y enfoca el primer error', invalid.errors && invalid.focus === 'f-nombre' && invalid.opened === 0, JSON.stringify(invalid));
  await page.screenshot({ path: `${OUT}/form-errores.png`, fullPage: false });
  await page.fill('#f-nombre', 'Prueba');
  await page.click('.chip:has(input[value="hacer una clase de prueba"])');
  await page.click('.chip:has(input[value="Mañanas"])');
  await page.click('[data-contact-form] button[type="submit"]');
  const sent = await page.evaluate(() => ({ url: window.__opened[0] || '', status: !document.querySelector('[data-form-status]').hidden }));
  const text = decodeURIComponent(sent.url.split('text=')[1] || '');
  check('[form] genera el enlace de WhatsApp con el mensaje', sent.url.startsWith('https://wa.me/34602091517?text=') && text.includes('Prueba') && text.includes('clase de prueba') && sent.status, text.replace(/\n/g, ' / '));
  await ctx.close();
}

// Metadatos
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE);
  const meta = await page.evaluate(() => {
    const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    return {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content || '',
      og: !!document.querySelector('meta[property="og:image"]'),
      lang: document.documentElement.lang,
      ldPhone: ld.telephone,
      ldAddress: ld.address?.streetAddress,
    };
  });
  check('[seo] title y description', meta.title.length >= 30 && meta.title.length <= 65 && meta.desc.length >= 120 && meta.desc.length <= 160, `${meta.title.length} / ${meta.desc.length} caracteres`);
  check('[seo] Open Graph, idioma y datos estructurados', meta.og && meta.lang === 'es' && meta.ldPhone === '+34 602 09 15 17' && /San Miguel, 29/.test(meta.ldAddress));
  await ctx.close();
}

await browser.close();
console.log(results.join('\n'));
console.log(`\n${results.length - failures}/${results.length} comprobaciones correctas. Capturas en ./${OUT}`);
process.exit(failures ? 1 : 0);
