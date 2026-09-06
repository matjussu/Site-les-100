// Verif-kit v2 - modifs catalogue du 2026-09-06 (demandes Matteo)
// Couvre : texte Edition Limitee, Le 80 dans l'archive saison, prix Le 48,
// Le 08 / Le 11 au format Gourmets, lots Ice Goukies, poids des minis,
// ingredients (marque retiree, azuki reformule), suppression du mot "Taille".
//
// Levier de falsification (regle 9) : SABOTAGE_VERIF=1 altere les MESURES lues
// (jamais le produit) et doit faire rougir le vecteur. Un vecteur qui reste
// vert sous sabotage ne prouve rien.
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
const erreursConsole = [];
s.page.on('pageerror', (e) => erreursConsole.push(String(e)));

// ============================================================ 1) CATALOGUE
await gotoWithRetry(
  s.page,
  `${srv.baseUrl}/Goukie.html`,
  () => !!document.querySelector('#edition-limitee .Goukie-card'),
);
await settle(s.page);

// -- 1a) Nouveau texte sous Edition Limitee
const descEdition = saboter(
  await s.page.$eval('#edition-limitee .category-description', (el) => el.textContent.trim()),
  'Découvrez nos créations spéciales, des recettes inédites à durée limitée.',
);
check(
  descEdition === 'Découvrez les Insolites, des goukies aux recettes inédites à durée limitée.',
  `texte Edition Limitee (${descEdition})`,
);

// -- 1b) Archive des Insolites : compteur et goukies de saison
const resume = await s.page.$eval('.insolites-archive-toggle', (el) => el.textContent.trim());
check(resume.includes('(10)'), `compteur archive a 10 (${resume})`);

await s.page.click('.insolites-archive-toggle');
await settle(s.page);

const saison = await s.page.$$eval(
  '.insolites-archive .subcategory-title',
  (titres) => {
    const t = titres.find((x) => x.textContent.includes('Goukies de saison'));
    const grille = t?.nextElementSibling;
    return [...(grille?.querySelectorAll('.Goukie-card') || [])].map((a) => ({
      href: a.getAttribute('href'),
      titre: a.querySelector('h3')?.textContent.trim(),
    }));
  },
);
console.log('SAISON', JSON.stringify(saison));
check(saison.length === 3, `3 goukies de saison archives (${saison.length})`);
check(
  saison.some((c) => c.href === 'Goukie-detail.html?id=le-80'),
  'Le 80 (ete) present dans les goukies de saison',
);

// -- 1c) Le 80 reste en vedette Goukie de saison
const vedettes = await s.page.$$eval('.insolites-featured .Goukie-card', (els) =>
  els.map((a) => ({ href: a.getAttribute('href'), badge: a.querySelector('.insolite-badge')?.textContent.trim() })),
);
check(
  vedettes.some((v) => v.href === 'Goukie-detail.html?id=le-80' && v.badge === 'Goukie de saison'),
  `Le 80 toujours en vedette Goukie de saison (${JSON.stringify(vedettes)})`,
);

// -- 1d) Aucune image cassee sur tout le catalogue, archive ouverte comprise
const imagesKo = await s.page.$$eval('.Goukie-card img', (els) =>
  els.filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')),
);
check(imagesKo.length === 0, `0 image cassee (${JSON.stringify(imagesKo)})`);

// -- 1e) Carte Le 08 : photo recadree servie et decodee
const carte08 = await s.page.$eval(
  '.Goukie-card[href="Goukie-detail.html?id=le-08"] img',
  (i) => ({ src: i.getAttribute('src'), nat: i.naturalWidth }),
);
check(carte08.src === 'goukie_images/08.webp' && carte08.nat === 400, `carte Le 08 (${JSON.stringify(carte08)})`);

await s.page.screenshot({ path: 'verify/captures/catalogue-septembre.png', fullPage: true });

// ============================================================ 2) FICHES
async function lireFiche(id) {
  await gotoWithRetry(
    s.page,
    `${srv.baseUrl}/Goukie-detail.html?id=${id}`,
    () => !!document.querySelector('.size-option'),
  );
  await settle(s.page);
  return s.page.evaluate(() => ({
    formats: [...document.querySelectorAll('.size-option')].map((b) => ({
      label: b.childNodes[0].textContent.trim(),
      prix: parseFloat(b.querySelector('.price').dataset.price),
    })),
    poids: document.querySelector('.Goukie-weight')?.textContent.trim() || null,
    ingredients: [...document.querySelectorAll('#ingredient-list li')].map((li) => li.textContent.trim()),
    labelTaille: !!document.querySelector('label[for="Goukie-size"]'),
    groupe: document.querySelector('.size-selector')?.getAttribute('aria-label') || null,
    imgNat: document.getElementById('Goukie-main-img')?.naturalWidth || 0,
  }));
}

const attendus = {
  'le-48': [["À l'unité", 5.5], ['Lot de 3', 15.5], ['Lot de 5', 26]],
  'le-80': [["À l'unité", 5.5], ['Lot de 3', 15.5], ['Lot de 5', 26]],
  'le-08': [["À l'unité", 5], ['Lot de 3', 14], ['Lot de 5', 23]],
  'le-11': [["À l'unité", 5], ['Lot de 3', 14], ['Lot de 5', 23]],
  'le-01': [["À l'unité", 8], ['Lot de 3', 23], ['Lot de 5', 39]],
  'ice-chocolat': [["À l'unité", 8], ['Lot de 3', 23], ['Lot de 5', 39]],
  'ice-coco': [["À l'unité", 8], ['Lot de 3', 23], ['Lot de 5', 39]],
  'le-35': [["À l'unité", 5], ['Lot de 3', 14], ['Lot de 5', 23]],
};

const fiches = {};
for (const [id, attendu] of Object.entries(attendus)) {
  const f = await lireFiche(id);
  fiches[id] = f;
  const formats = saboter(f.formats, [{ label: 'Petit', prix: 3 }]);
  const rendu = formats.map((x) => `${x.label} ${x.prix.toFixed(2)}`).join(' | ');
  const conforme =
    formats.length === attendu.length &&
    attendu.every(([label, prix], i) => formats[i].label === label && formats[i].prix === prix);
  check(conforme, `${id} formats = ${attendu.map(([l, p]) => `${l} ${p.toFixed(2)}`).join(' | ')} (${rendu})`);
  check(!f.labelTaille, `${id} : le mot "Taille" a disparu`);
  check(f.groupe === 'Format', `${id} : selecteur annonce comme groupe "Format" (${f.groupe})`);
  check(f.imgNat > 0, `${id} : photo principale decodee (${f.imgNat}px)`);
}

// -- 2a) Le 08 et Le 11 : plus de bouton Petit ni de lot de 4
for (const id of ['le-08', 'le-11']) {
  const labels = saboter(fiches[id].formats.map((x) => x.label), ['Petit', 'Lot de 4']);
  check(!labels.includes('Petit'), `${id} : plus de bouton Petit (${labels.join(', ')})`);
  check(!labels.includes('Lot de 4'), `${id} : plus de lot de 4 (${labels.join(', ')})`);
}

// -- 2b) Ingredients : marque retiree, azuki reformule
const fiche35 = await lireFiche('le-35');
const ing35 = saboter(fiche35.ingredients, ['Pâte de haricots rouges Azuki']);
check(ing35.includes('Haricot rouge azuki'), `le-35 : "Haricot rouge azuki" (${ing35.join(', ')})`);
check(!ing35.some((i) => i.toLowerCase().includes('pâte de haricots')), 'le-35 : "Pâte de haricots" retire');

for (const id of ['le-08', 'le-06', 'le-18', 'le-08-m', 'le-06m', 'le-18m']) {
  const f = await lireFiche(id);
  const ing = saboter(f.ingredients, ['Chocolat en poudre van Houten']);
  check(!ing.some((i) => i.toLowerCase().includes('houten')), `${id} : marque van Houten retiree`);
  check(ing.includes('Chocolat en poudre Noir Intense'), `${id} : "Chocolat en poudre Noir Intense" present`);
}

// -- 2c) Minis : poids unitaire affiche
for (const id of ['le-03m', 'le-04m', 'le-06m', '10mini', 'le-18m', 'le-27m', 'le-08-m', 'le-11m', 'le-12']) {
  const f = await lireFiche(id);
  const poids = saboter(f.poids, 'Poids : 100 g');
  check(poids === 'Poids : 50 g', `${id} : poids 50 g (${poids})`);
}

// -- 2d) Les goukies standards gardent leur poids
const f88 = await lireFiche('le-88');
check(f88.poids === 'Poids : 100 g', `le-88 : poids inchange (${f88.poids})`);

check(erreursConsole.length === 0, `0 erreur JS (${JSON.stringify(erreursConsole)})`);

// Captures nommees APRES navigation explicite : une capture prise en fin de
// boucle porterait le nom d'une fiche et le contenu d'une autre.
for (const id of ['le-08', 'ice-chocolat', 'le-08-m']) {
  await lireFiche(id);
  await s.page.screenshot({ path: `verify/captures/fiche-${id}.png` });
}
srv.stop();
done();
