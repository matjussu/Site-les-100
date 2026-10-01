// Verif-kit v2 - ordre 2026-10-01-0945 (goukie du mois Le 67 + vedettes octobre)
// Adapte de goukie-du-mois-le48 : Le 67 devient le goukie du mois et Le 09 le
// goukie de saison ; Le 48 et Le 80 quittent la vedette et basculent dans
// l'archive des Insolites. Serveur statique python http.server, harness du kit.
//
// Levier de falsification (regle 9) : SABOTAGE_VERIF=1 altere les MESURES lues
// (jamais le produit) et DOIT faire rougir le vecteur.
import { startPreview, launchPage, gotoWithRetry, settle, makeCheck }
  from '/home/matteo_linux/projets/.claude/verify-kit/harness.mjs';
import { mkdirSync } from 'node:fs';

mkdirSync('verify/captures', { recursive: true });
const { check, done } = makeCheck();

const SABOTAGE = process.env.SABOTAGE_VERIF === '1';
const saboter = (mesure, faux) => (SABOTAGE ? faux : mesure);
if (SABOTAGE) console.log('MODE SABOTAGE : les mesures sont falsifiees, le vecteur DOIT rougir\n');

const srv = await startPreview({ command: 'python3 -m http.server {port}' });
console.log('server', srv.baseUrl);

const s = await launchPage({ device: 'desktop', reducedMotion: 'reduce' });

// ============================================================ 1) GRILLE Goukie.html
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie.html`,
  () => !!document.querySelector('#edition-limitee .Goukie-card'),
);
await settle(s.page);

// -- 1a) Edition Limitee : Le 67 en vedette (1re card), Le 09 (saison) conserve
const editionMes = await s.page.$$eval('#edition-limitee .Goukie-card', (els) =>
  els.map((a) => ({
    href: a.getAttribute('href'),
    title: a.querySelector('h3')?.textContent?.trim() || null,
    src: a.querySelector('img')?.getAttribute('src') || null,
    natW: a.querySelector('img')?.naturalWidth || 0,
    natH: a.querySelector('img')?.naturalHeight || 0,
  })),
);
console.log('EDITION-LIMITEE', JSON.stringify(editionMes, null, 2));
const edition = saboter(editionMes, [
  { href: 'Goukie-detail.html?id=le-48', title: 'Le 48', src: 'goukie_images/48.webp', natW: 400, natH: 400 },
  { href: 'Goukie-detail.html?id=le-80', title: 'Le 80', src: 'goukie_images/80.webp', natW: 400, natH: 400 },
]);
check(edition.length === 2, `edition-limitee = 2 cards (${edition.length})`);
check(edition[0]?.href === 'Goukie-detail.html?id=le-67', `1re card edition = Le 67 (${edition[0]?.href})`);
check(edition[0]?.title === 'Le 67', `1re card titre = Le 67 (${edition[0]?.title})`);
check(edition[0]?.src === 'goukie_images/67.webp', `1re card img = 67.webp (${edition[0]?.src})`);
check(edition[0]?.natW === 400 && edition[0]?.natH === 400, `img Le 67 peinte 400x400 (${edition[0]?.natW}x${edition[0]?.natH})`);
check(edition.some((c) => c.href === 'Goukie-detail.html?id=le-09'), 'Le 09 (saison) present en edition-limitee');
check(
  !edition.some((c) => (c.href || '').includes('id=le-48') || (c.href || '').includes('id=le-80')),
  'plus de Le 48 / Le 80 en vedette edition-limitee',
);

// -- 1b) Insolites featured : Le 67 badge "Goukie du mois", Le 09 badge "Goukie de saison"
const featured = await s.page.$$eval('#les-insolites .insolites-featured .Goukie-card', (els) =>
  els.map((a) => ({
    href: a.getAttribute('href'),
    badge: a.querySelector('.insolite-badge')?.textContent?.trim() || null,
    natW: a.querySelector('img')?.naturalWidth || 0,
  })),
);
console.log('INSOLITES-FEATURED', JSON.stringify(featured, null, 2));
const le67Feat = featured.find((c) => c.href === 'Goukie-detail.html?id=le-67');
check(!!le67Feat, 'Le 67 present en insolites featured');
check(saboter(le67Feat?.badge, 'Goukie de saison') === 'Goukie du mois', `Le 67 badge = Goukie du mois (${le67Feat?.badge})`);
check(le67Feat?.natW === 400, `img Le 67 featured peinte (natW ${le67Feat?.natW})`);
const le09Feat = featured.find((c) => c.href === 'Goukie-detail.html?id=le-09');
check(!!le09Feat && le09Feat.badge === 'Goukie de saison', `Le 09 badge = Goukie de saison (${le09Feat?.badge})`);
check(
  !featured.some((c) => (c.href || '').includes('id=le-48') || (c.href || '').includes('id=le-80')),
  'plus de Le 48 / Le 80 en insolites featured',
);

// -- 1c) Archive : compteur (11) + Le 48 descendu, Le 07 conserve, Le 80 en saison
const archiveCounter = await s.page.$eval('.insolites-archive-toggle', (el) => el.textContent.trim());
check(/\(11\)/.test(saboter(archiveCounter, 'Voir les anciens goukies (10)')), `compteur archive = 11 (${archiveCounter})`);
await s.page.evaluate(() => { const d = document.querySelector('.insolites-archive'); if (d) d.open = true; });
await settle(s.page);

const lireSousCategorie = (titre) =>
  s.page.evaluate((t) => {
    const h = [...document.querySelectorAll('.insolites-archive .subcategory-title')]
      .find((x) => x.textContent.includes(t));
    const grille = h?.nextElementSibling;
    return [...(grille?.querySelectorAll('.Goukie-card') || [])].map((a) => a.getAttribute('href'));
  }, titre);

const archiveMois = saboter(await lireSousCategorie('Goukies du mois'), []);
console.log('ARCHIVE-MOIS', JSON.stringify(archiveMois, null, 2));
check(archiveMois.includes('Goukie-detail.html?id=le-48'), `Le 48 bascule en archive des mois (${archiveMois.length} cards)`);
check(archiveMois.includes('Goukie-detail.html?id=juillet'), 'Le 07 (juillet) conserve en archive des mois');

const archiveSaison = await lireSousCategorie('Goukies de saison');
console.log('ARCHIVE-SAISON', JSON.stringify(archiveSaison, null, 2));
check(archiveSaison.includes('Goukie-detail.html?id=le-80'), `Le 80 present dans l'archive de saison (${archiveSaison.length} cards)`);

// -- 1d) Dissolution Essentiels : sections + liens nav absents (regression septembre)
check((await s.page.$('#les-essentiels')) === null, 'section #les-essentiels absente');
check((await s.page.$('#les-minis-essentiels')) === null, 'section #les-minis-essentiels absente');
check((await s.page.$('a[href="#les-essentiels"]')) === null, 'lien nav Essentiels absent');

// -- 1e) le-08 / le-11 toujours en Gourmets (regression)
const gourmets = await s.page.$$eval('#les-gourmets .Goukie-card', (els) => els.map((a) => a.getAttribute('href')));
check(gourmets.includes('Goukie-detail.html?id=le-08'), 'le-08 affiche en Gourmets');
check(gourmets.includes('Goukie-detail.html?id=le-11'), 'le-11 affiche en Gourmets');

await s.page.locator('#edition-limitee').screenshot({ path: 'verify/captures/le67-edition-limitee.png' });
await s.page.locator('#les-insolites').screenshot({ path: 'verify/captures/le67-insolites.png' });

// ============================================================ 2) FICHE DETAIL Le 67
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie-detail.html?id=le-67`,
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
  formats: [...document.querySelectorAll('.size-option')].map((b) => ({
    label: b.childNodes[0].textContent.trim(),
    prix: parseFloat(b.querySelector('.price').dataset.price),
  })),
}));
console.log('DETAIL le-67 =>', JSON.stringify(detail, null, 2));
check(detail.name === 'Le 67', `detail nom = Le 67 (${detail.name})`);
check(/noisette/i.test(detail.desc || ''), 'detail desc mentionne la noisette');
check(detail.ingredients.includes('Beurre de noisette maison bio'), 'ingredient "Beurre de noisette maison bio" present');
check(detail.ingredients.includes('Chocolat blanc vegan'), 'ingredient "Chocolat blanc vegan" present');
check(detail.imgSrc?.endsWith('goukie_images/67.webp'), `image principale = 67.webp (${detail.imgSrc})`);
check(detail.imgW > 0, `image detail peinte (naturalWidth ${detail.imgW})`);
check(detail.thumbs === 2, `carrousel 2 vignettes (${detail.thumbs})`);

// prix : unitaire 5.50 + lots du palier 5.50 (15.50 / 26.00)
const uniteBtn = detail.formats.find((f) => f.label === "À l'unité");
const prixUnitaire = saboter(uniteBtn?.prix ?? null, 4.5);
check(prixUnitaire === 5.5, `prix unitaire Le 67 = 5.50 (${prixUnitaire})`);
check(/5[.,]50\s*€/.test(saboter(detail.bodyText, "À l'unité 4.50 €")), 'prix 5.50 € visible dans la fiche');
check(
  detail.formats.some((f) => f.prix === 15.5) && detail.formats.some((f) => f.prix === 26),
  `lots 5.50 presents : 15.50 / 26.00 (${detail.formats.map((f) => f.prix).join(', ')})`,
);
await s.page.screenshot({ path: 'verify/captures/le67-detail.png', fullPage: true });

// 2e image du carrousel (coupee)
await s.page.locator('#thumbnail-container .thumbnail').nth(1).click();
await settle(s.page);
const img2src = await s.page.evaluate(() => document.getElementById('Goukie-main-img')?.getAttribute('src') || null);
check(img2src?.endsWith('goukie_images/67-2.webp'), `2e image carrousel = 67-2.webp (${img2src})`);

// ============================================================ 3) CONSOLE
check(s.consoleErrors.length === 0, `0 erreur console (${s.consoleErrors.length})`);
if (s.consoleErrors.length) console.log('CONSOLE ERRORS', JSON.stringify(s.consoleErrors, null, 2));

await s.close();
srv.stop();
done();
