// Verif-kit v2 - ordre 2026-09-02-0817 (goukie du mois Le 48 + reorg catalogue)
// Serveur statique python http.server, harness Playwright du kit partage.
import { startPreview, launchPage, gotoWithRetry, settle, makeCheck }
  from '/home/matteo_linux/projets/.claude/verify-kit/harness.mjs';
import { mkdirSync } from 'node:fs';

mkdirSync('verify/captures', { recursive: true });
const { check, done } = makeCheck();

const srv = await startPreview({ command: 'python3 -m http.server {port}' });
console.log('server', srv.baseUrl);

// reducedMotion 'reduce' : le site revele les cards via gsap.from(opacity:0) au
// ScrollTrigger ; sous reduce, script.js les pose directement en opacity:1
// (chemin natif, pas un hack) -> captures stables et representatives de l'etat
// final vu par l'utilisateur normal apres l'animation.
const s = await launchPage({ device: 'desktop', reducedMotion: 'reduce' });

// ============================================================ 1) GRILLE Goukie.html
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie.html`,
  () => !!document.querySelector('#edition-limitee .Goukie-card'),
);
await settle(s.page);

// -- 1a) Edition Limitee : Le 48 en vedette (1re card), Le 80 conserve
const edition = await s.page.$$eval('#edition-limitee .Goukie-card', (els) =>
  els.map((a) => ({
    href: a.getAttribute('href'),
    title: a.querySelector('h3')?.textContent?.trim() || null,
    src: a.querySelector('img')?.getAttribute('src') || null,
    natW: a.querySelector('img')?.naturalWidth || 0,
    natH: a.querySelector('img')?.naturalHeight || 0,
  })),
);
console.log('EDITION-LIMITEE', JSON.stringify(edition, null, 2));
check(edition.length === 2, `edition-limitee = 2 cards (${edition.length})`);
check(edition[0]?.href === 'Goukie-detail.html?id=le-48', `1re card edition = Le 48 (${edition[0]?.href})`);
check(edition[0]?.title === 'Le 48', `1re card titre = Le 48 (${edition[0]?.title})`);
check(edition[0]?.src === 'goukie_images/48.webp', `1re card img = 48.webp (${edition[0]?.src})`);
check(edition[0]?.natW === 400 && edition[0]?.natH === 400, `img Le 48 peinte 400x400 (${edition[0]?.natW}x${edition[0]?.natH})`);
check(edition.some((c) => c.href === 'Goukie-detail.html?id=le-80'), 'Le 80 (saison) conserve en edition-limitee');
check(!edition.some((c) => (c.href || '').includes('id=juillet') || (c.href || '').includes('id=le-07')), 'plus de matcha en vedette edition-limitee');

// -- 1b) Insolites featured : Le 48 badge "Goukie du mois", Le 80 saison, plus de matcha
const featured = await s.page.$$eval('#les-insolites .insolites-featured .Goukie-card', (els) =>
  els.map((a) => ({
    href: a.getAttribute('href'),
    title: a.querySelector('h3')?.textContent?.trim() || null,
    badge: a.querySelector('.insolite-badge')?.textContent?.trim() || null,
    natW: a.querySelector('img')?.naturalWidth || 0,
  })),
);
console.log('INSOLITES-FEATURED', JSON.stringify(featured, null, 2));
const le48Feat = featured.find((c) => c.href === 'Goukie-detail.html?id=le-48');
check(!!le48Feat, 'Le 48 present en insolites featured');
check(le48Feat?.badge === 'Goukie du mois', `Le 48 badge = Goukie du mois (${le48Feat?.badge})`);
check(le48Feat?.natW === 400, `img Le 48 featured peinte (natW ${le48Feat?.natW})`);
check(featured.some((c) => c.href === 'Goukie-detail.html?id=le-80'), 'Le 80 (saison) conserve en insolites featured');
check(!featured.some((c) => (c.href || '').includes('id=le-07')), 'plus de matcha (le-07) en insolites featured');

// -- 1c) Archive : compteur (9) + card matcha (id=juillet) dans "Goukies du mois"
const archiveCounter = await s.page.$eval('.insolites-archive-toggle', (el) => el.textContent.trim());
check(/\(9\)/.test(archiveCounter), `compteur archive = 9 (${archiveCounter})`);
// ouvrir le details pour declencher le lazy-load des images d'archive
await s.page.evaluate(() => { const d = document.querySelector('.insolites-archive'); if (d) d.open = true; });
await settle(s.page);
const archiveMatcha = await s.page.$$eval('.insolites-archive a[href*="id=juillet"]', (els) =>
  els.map((a) => ({ title: a.querySelector('h3')?.textContent?.trim() || null, natW: a.querySelector('img')?.naturalWidth || 0 })),
);
console.log('ARCHIVE-MATCHA', JSON.stringify(archiveMatcha, null, 2));
check(archiveMatcha.length === 1, `1 card matcha en archive (${archiveMatcha.length})`);
check(archiveMatcha[0]?.title === 'Le 07', `card archive titre = Le 07 (${archiveMatcha[0]?.title})`);

// -- 1d) Dissolution Essentiels : sections absentes + liens nav absents
const essentielsSection = await s.page.$('#les-essentiels');
check(essentielsSection === null, 'section #les-essentiels supprimee');
const miniEssSection = await s.page.$('#les-minis-essentiels');
check(miniEssSection === null, 'section #les-minis-essentiels supprimee');
const navEss = await s.page.$('a[href="#les-essentiels"]');
check(navEss === null, 'lien nav Essentiels supprime');
const navMiniEss = await s.page.$('a[href="#les-minis-essentiels"]');
check(navMiniEss === null, 'lien nav Minis Essentiels supprime');

// -- 1e) le-08 / le-11 deplaces en Gourmets (categorie JSON inchangee)
const gourmets = await s.page.$$eval('#les-gourmets .Goukie-card', (els) => els.map((a) => a.getAttribute('href')));
check(gourmets.includes('Goukie-detail.html?id=le-08'), 'le-08 affiche en Gourmets');
check(gourmets.includes('Goukie-detail.html?id=le-11'), 'le-11 affiche en Gourmets');
const miniGourmets = await s.page.$$eval('#les-minis-gourmets .Goukie-card', (els) => els.map((a) => a.getAttribute('href')));
check(miniGourmets.includes('Goukie-detail.html?id=le-08-m'), 'Mini 08 affiche en Minis Gourmets');
check(miniGourmets.includes('Goukie-detail.html?id=le-11m'), 'Mini 11 affiche en Minis Gourmets');

// -- 1f) Cranberry Le 05 (+ mini) totalement absent de la page
const cranberry = await s.page.$$eval('a[href*="id=le-05"]', (els) => els.length);
check(cranberry === 0, `cranberry le-05/le-05m absent de la grille (${cranberry} occurrence)`);

// -- 1g) toutes les images de la grille sont peintes (pas de vignette grise)
const brokenImgs = await s.page.$$eval('.Goukies-grid img, .insolites-featured img', (els) =>
  els.filter((i) => i.getAttribute('loading') !== 'lazy' || i.getBoundingClientRect().top < window.innerHeight)
     .map((i) => ({ src: i.getAttribute('src'), natW: i.naturalWidth }))
     .filter((i) => i.natW === 0),
);
console.log('BROKEN-IMGS (visibles)', JSON.stringify(brokenImgs, null, 2));

// captures grille
await s.page.locator('#edition-limitee').screenshot({ path: 'verify/captures/le48-edition-limitee.png' });
await s.page.locator('#les-insolites').screenshot({ path: 'verify/captures/le48-insolites.png' });
await s.page.locator('#les-gourmets').screenshot({ path: 'verify/captures/le48-gourmets.png' });

// ============================================================ 2) FICHE DETAIL Le 48
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie-detail.html?id=le-48`,
  () => {
    const i = document.getElementById('Goukie-main-img');
    return i && (i.getAttribute('src') || '').includes('goukie_images');
  },
);
await settle(s.page);
const detail = await s.page.evaluate(() => ({
  name: document.getElementById('Goukie-name')?.textContent?.trim() || null,
  desc: document.getElementById('Goukie-desc')?.textContent?.trim() || null,
  ingredients: [...document.querySelectorAll('#ingredient-list li')].map((li) => li.textContent.trim()),
  bodyText: document.body.innerText,
  imgSrc: document.getElementById('Goukie-main-img')?.getAttribute('src') || null,
  imgW: document.getElementById('Goukie-main-img')?.naturalWidth || 0,
  thumbs: document.querySelectorAll('#thumbnail-container .thumbnail').length,
  prevVisible: getComputedStyle(document.getElementById('prev-image-btn')).display !== 'none',
  nextVisible: getComputedStyle(document.getElementById('next-image-btn')).display !== 'none',
}));
console.log('DETAIL le-48 =>', JSON.stringify(detail, null, 2));
check(detail.name === 'Le 48', `detail nom = Le 48 (${detail.name})`);
check(/septembre/i.test(detail.desc || ''), 'detail desc mentionne septembre');
check(detail.ingredients.includes('Café bio'), 'ingredient "Café bio" present');
check(detail.ingredients.includes('Guarana bio'), 'ingredient "Guarana bio" present');
check(detail.imgSrc?.endsWith('goukie_images/48.webp'), `image principale = 48.webp (${detail.imgSrc})`);
check(detail.imgW > 0, `image detail peinte (naturalWidth ${detail.imgW})`);
check(detail.thumbs === 2, `carrousel 2 vignettes (${detail.thumbs})`);
check(detail.prevVisible && detail.nextVisible, 'boutons carrousel prev/next visibles');
check(/4[.,]50\s*€/.test(detail.bodyText), 'prix 4.50 euros affiche');
await s.page.screenshot({ path: 'verify/captures/le48-detail.png', fullPage: true });

// verifier la 2e image du carrousel (coupee)
await s.page.locator('#thumbnail-container .thumbnail').nth(1).click();
await settle(s.page);
const img2 = await s.page.evaluate(() => ({
  src: document.getElementById('Goukie-main-img')?.getAttribute('src') || null,
  natW: document.getElementById('Goukie-main-img')?.naturalWidth || 0,
}));
check(img2.src?.endsWith('goukie_images/48-2.webp'), `2e image carrousel = 48-2.webp (${img2.src})`);
check(img2.natW > 0, `2e image peinte (natW ${img2.natW})`);

// ============================================================ 3) CONSOLE
check(s.consoleErrors.length === 0, `0 erreur console (${s.consoleErrors.length})`);
if (s.consoleErrors.length) console.log('CONSOLE ERRORS', JSON.stringify(s.consoleErrors, null, 2));

await s.close();
srv.stop();
done();
