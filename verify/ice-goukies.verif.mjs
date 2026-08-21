// Verif-kit v2 - chantier ice-goukies-choco-coco (ordre 2026-08-21-2037)
// Serveur statique python http.server, harness Playwright du kit partage.
import { startPreview, launchPage, gotoWithRetry, settle, makeCheck }
  from '/home/matteo_linux/projets/.claude/verify-kit/harness.mjs';
import { mkdirSync } from 'node:fs';

mkdirSync('verify/captures', { recursive: true });
const { check, done } = makeCheck();

const srv = await startPreview({ command: 'python3 -m http.server {port}' });
console.log('server', srv.baseUrl);

const s = await launchPage({ device: 'desktop' });

// 1) Page catalogue : grille Ice Goukies
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie.html`,
  () => !!document.querySelector('#ice-goukie .Goukie-card'),
);
await settle(s.page);

const cards = await s.page.$$eval('#ice-goukie .Goukie-card', (els) =>
  els.map((a) => ({
    href: a.getAttribute('href'),
    title: a.querySelector('h3')?.textContent?.trim() || null,
    src: a.querySelector('img')?.getAttribute('src') || null,
    natW: a.querySelector('img')?.naturalWidth || 0,
    natH: a.querySelector('img')?.naturalHeight || 0,
  })),
);
console.log('ICE CARDS', JSON.stringify(cards, null, 2));
check(cards.length === 3, `grille ice = 3 cartes (${cards.length})`);
check(
  cards.map((c) => c.title).join(',') === 'Vanille,Chocolat,Coco',
  `titres = Vanille,Chocolat,Coco (${cards.map((c) => c.title).join(',')})`,
);
check(
  cards.map((c) => c.href).join(',') ===
    'Goukie-detail.html?id=le-01,Goukie-detail.html?id=ice-chocolat,Goukie-detail.html?id=ice-coco',
  'href des 3 cartes corrects',
);
check(
  cards.every((c) => c.natW === 400 && c.natH === 400),
  'les 3 images grille peintes en 400x400 (ratio carre non deforme)',
);

const h2 = await s.page.$eval('#ice-goukie .category-title', (el) => el.textContent.trim());
check(h2 === 'Ice Goukies', `titre section = Ice Goukies (${h2})`);
const nav = await s.page.$eval('a[href="#ice-goukie"].category-nav-link', (el) => el.textContent.trim());
check(nav === 'Ice Goukies', `lien nav = Ice Goukies (${nav})`);

await s.page.locator('#ice-goukie').screenshot({ path: 'verify/captures/ice-grid.png' });

// 2) Pages detail des 3 fiches
const specs = [
  { id: 'le-01', nom: 'Vanille', ingr: "Lait d'amande vanille bio", img: 'goukie_images/01.webp' },
  { id: 'ice-chocolat', nom: 'Chocolat', ingr: 'Cacao', img: 'goukie_images/ice-chocolat.webp' },
  { id: 'ice-coco', nom: 'Coco', ingr: 'Lait de coco bio', img: 'goukie_images/ice-coco.webp' },
];
for (const sp of specs) {
  await gotoWithRetry(
    s.page,
    `${srv.baseUrl}/Goukie-detail.html?id=${sp.id}`,
    () => {
      const i = document.getElementById('Goukie-main-img');
      return i && i.getAttribute('src') && i.getAttribute('src').includes('goukie_images');
    },
  );
  await settle(s.page);
  const d = await s.page.evaluate(() => ({
    name: document.getElementById('Goukie-name')?.textContent?.trim() || null,
    desc: document.getElementById('Goukie-desc')?.textContent?.trim() || null,
    ingredients: [...document.querySelectorAll('#ingredient-list li')].map((li) => li.textContent.trim()),
    bodyText: document.body.innerText,
    imgSrc: document.getElementById('Goukie-main-img')?.getAttribute('src') || null,
    imgW: document.getElementById('Goukie-main-img')?.naturalWidth || 0,
  }));
  console.log('DETAIL', sp.id, '=>', d.name, '|', d.imgSrc, '| natW', d.imgW, '|', JSON.stringify(d.ingredients));
  check(d.name === sp.nom, `${sp.id}: nom = ${sp.nom} (${d.name})`);
  check(d.ingredients.includes(sp.ingr), `${sp.id}: ingredient "${sp.ingr}" present`);
  check(d.imgSrc && d.imgSrc.endsWith(sp.img), `${sp.id}: image = ${sp.img} (${d.imgSrc})`);
  check(d.imgW > 0, `${sp.id}: image detail peinte (naturalWidth ${d.imgW})`);
  check(/8[.,]00\s*€|8\s*€/.test(d.bodyText), `${sp.id}: prix 8 euros affiche`);
  await s.page.screenshot({ path: `verify/captures/detail-${sp.id}.png`, fullPage: true });
}

check(s.consoleErrors.length === 0, `0 erreur console (${s.consoleErrors.length})`);
if (s.consoleErrors.length) console.log('CONSOLE ERRORS', JSON.stringify(s.consoleErrors, null, 2));

await s.close();
srv.stop();
done();
