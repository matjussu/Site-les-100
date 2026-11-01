// Verif-kit v2 - ordre 2026-11-01-1805 (novembre : Le 31 goukie du mois, Geant
// Insolites, epicerie a 5 produits). Adapte de goukie-du-mois-le67 : Le 31 devient
// le goukie du mois (Le 09 reste goukie de saison), Le 67 descend dans l'archive
// des mois. Ingredients du Le 31 : vides le 01/11 (decision Matteo 13961), puis
// fournis par la cliente le meme soir (ordre 2026-11-01-1910) : bloc affiche.
// Descriptifs Almond / Peanut Butter remplaces par ceux de la cliente (meme ordre).
// Serveur statique python http.server, harness du kit.
//
// Levier de falsification (regle 9) : SABOTAGE_VERIF=1 altere les MESURES lues
// (jamais le produit) et DOIT faire rougir le vecteur.
import { startPreview, launchPage, gotoWithRetry, settle, makeCheck }
  from '/home/matteo_linux/projets/.claude/verify-kit/harness.mjs';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

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

const carte = (a) => ({
  href: a.getAttribute('href'),
  title: a.querySelector('h3')?.textContent?.trim() || null,
  src: a.querySelector('img')?.getAttribute('src') || null,
  natW: a.querySelector('img')?.naturalWidth || 0,
  natH: a.querySelector('img')?.naturalHeight || 0,
  badge: a.querySelector('.insolite-badge')?.textContent?.trim() || null,
});

// -- 1a) Edition Limitee : Le 31 en 1re card, Le 09 (saison) conserve
const edition = saboter(
  await s.page.$$eval('#edition-limitee .Goukie-card', (els, f) => els.map(new Function(`return ${f}`)()), carte.toString()),
  [{ href: 'Goukie-detail.html?id=le-67', title: 'Le 67', src: 'goukie_images/67.webp', natW: 400, natH: 400 }],
);
console.log('EDITION-LIMITEE', JSON.stringify(edition));
check(edition.length === 2, `edition-limitee = 2 cards (${edition.length})`);
check(edition[0]?.href === 'Goukie-detail.html?id=le-31', `1re card edition = Le 31 (${edition[0]?.href})`);
check(edition[0]?.title === 'Le 31', `1re card titre = Le 31 (${edition[0]?.title})`);
check(edition[0]?.src === 'goukie_images/31.webp', `1re card img = 31.webp (${edition[0]?.src})`);
check(edition[0]?.natW === 400 && edition[0]?.natH === 400, `img Le 31 peinte 400x400 (${edition[0]?.natW}x${edition[0]?.natH})`);
check(edition.some((c) => c.href === 'Goukie-detail.html?id=le-09'), 'Le 09 (saison) present en edition-limitee');
check(!edition.some((c) => (c.href || '').includes('id=le-67')), 'plus de Le 67 en vedette edition-limitee');

// -- 1b) Insolites featured : Le 31 badge "Goukie du mois", Le 09 "Goukie de saison"
const featured = await s.page.$$eval('#les-insolites .insolites-featured .Goukie-card', (els, f) =>
  els.map(new Function(`return ${f}`)()), carte.toString());
console.log('INSOLITES-FEATURED', JSON.stringify(featured));
const le31Feat = featured.find((c) => c.href === 'Goukie-detail.html?id=le-31');
check(!!le31Feat, 'Le 31 present en insolites featured');
check(saboter(le31Feat?.badge, 'Goukie de saison') === 'Goukie du mois', `Le 31 badge = Goukie du mois (${le31Feat?.badge})`);
check(le31Feat?.natW === 400, `img Le 31 featured peinte (natW ${le31Feat?.natW})`);
const le09Feat = featured.find((c) => c.href === 'Goukie-detail.html?id=le-09');
check(le09Feat?.badge === 'Goukie de saison', `Le 09 badge = Goukie de saison (${le09Feat?.badge})`);
check(!featured.some((c) => (c.href || '').includes('id=le-67')), 'plus de Le 67 en insolites featured');

// -- 1c) Archive : compteur (12) + Le 67 descendu en tete des goukies du mois
const archiveCounter = await s.page.$eval('.insolites-archive-toggle', (el) => el.textContent.trim());
check(/\(12\)/.test(saboter(archiveCounter, 'Voir les anciens goukies (11)')), `compteur archive = 12 (${archiveCounter})`);
await s.page.evaluate(() => { const d = document.querySelector('.insolites-archive'); if (d) d.open = true; });
await settle(s.page);
const archive = await s.page.evaluate(() => {
  const cartes = [...document.querySelectorAll('.insolites-archive .Goukie-card')];
  const h = [...document.querySelectorAll('.insolites-archive .subcategory-title')]
    .find((x) => x.textContent.includes('Goukies du mois'));
  return {
    total: cartes.length,
    mois: [...(h?.nextElementSibling?.querySelectorAll('.Goukie-card') || [])].map((a) => a.getAttribute('href')),
    le67Peinte: cartes.find((a) => a.getAttribute('href').endsWith('id=le-67'))?.querySelector('img')?.naturalWidth || 0,
  };
});
console.log('ARCHIVE', JSON.stringify(archive));
const mois = saboter(archive.mois, []);
check(mois[0] === 'Goukie-detail.html?id=le-67', `Le 67 en tete de l'archive des mois (${mois[0]})`);
check(mois.includes('Goukie-detail.html?id=le-48'), 'Le 48 conserve en archive des mois');
check(archive.total === 12, `compteur (12) = nombre reel de cards archivees (${archive.total})`);
check(archive.le67Peinte === 400, `img Le 67 en archive peinte (${archive.le67Peinte})`);

// -- 1d) Geant Insolites : nouvelle photo, Le 02 garde 02.webp
const geant = await s.page.$eval('a[href="Goukie-detail.html?id=geant-insolites"] img', (i) =>
  ({ src: i.getAttribute('src'), natW: i.naturalWidth }));
const le02 = await s.page.$eval('a[href="Goukie-detail.html?id=le-02"] img', (i) => i.getAttribute('src'));
check(saboter(geant.src, 'goukie_images/02.webp') === 'goukie_images/geant-insolites.webp', `card Geant Insolites = geant-insolites.webp (${geant.src})`);
check(geant.natW === 400, `img Geant Insolites peinte (${geant.natW})`);
check(le02 === 'goukie_images/02.webp', `Le 02 garde 02.webp (${le02})`);
const o2 = execSync('git status --porcelain -- goukie_images/02.png goukie_images/02.webp goukie_images/02-2.png').toString().trim();
check(saboter(o2, ' M goukie_images/02.png') === '', `02.png / 02.webp / 02-2.png intacts (git status: "${o2}")`);

await s.page.locator('#edition-limitee').screenshot({ path: 'verify/captures/le31-edition-limitee.png' });
await s.page.locator('#les-insolites').screenshot({ path: 'verify/captures/le31-insolites.png' });
await s.page.locator('#les-geants').screenshot({ path: 'verify/captures/geants-novembre.png' });

// ============================================================ 2) FICHES DETAIL
const lireFiche = async (id) => {
  await gotoWithRetry(
    s.page,
    `${srv.baseUrl}/Goukie-detail.html?id=${id}`,
    () => (document.getElementById('Goukie-main-img')?.getAttribute('src') || '').includes('goukie_images'),
  );
  await settle(s.page);
  return s.page.evaluate(() => {
    const bloc = document.querySelector('.Goukie-ingredients');
    return {
      name: document.getElementById('Goukie-name')?.textContent?.trim() || null,
      desc: document.getElementById('Goukie-desc')?.textContent?.trim() || null,
      ingredients: [...document.querySelectorAll('#ingredient-list li')].map((li) => li.textContent.trim()),
      blocVisible: !!bloc && bloc.offsetParent !== null && bloc.getBoundingClientRect().height > 0,
      provenance: document.querySelector('.provenance-text')?.textContent?.trim() || null,
      imgSrc: document.getElementById('Goukie-main-img')?.getAttribute('src') || null,
      imgW: document.getElementById('Goukie-main-img')?.naturalWidth || 0,
      thumbs: document.querySelectorAll('#thumbnail-container .thumbnail').length,
      formats: [...document.querySelectorAll('.size-option')].map((b) => ({
        label: b.childNodes[0].textContent.trim(),
        prix: parseFloat(b.querySelector('.price').dataset.price),
      })),
    };
  });
};

// -- 2a) Le 31
const le31 = await lireFiche('le-31');
console.log('DETAIL le-31 =>', JSON.stringify(le31));
check(le31.name === 'Le 31', `Le 31 : nom (${le31.name})`);
check(
  le31.desc === "Un Goukie aux douces saveurs d'automne, avec une pâte à la pumpkin délicatement parfumée aux épices Pumpkin Spice et un cœur fondant de Pumpkin Butter maison.",
  'Le 31 : description de Matteo mot pour mot',
);
check(
  JSON.stringify(saboter(le31.ingredients, [])) === JSON.stringify(
    ['Butternut', 'Farine de riz', 'Sucre de canne non raffiné', 'Compote de pomme', 'Pomme bio', 'Épices de Noël']),
  `Le 31 : 6 ingredients de la cliente, dans l'ordre (${le31.ingredients.join(' | ')})`,
);
check(saboter(le31.blocVisible, false) === true, 'Le 31 : bloc "Ingredients principaux" affiche');
check(le31.imgSrc?.endsWith('goukie_images/31.webp') && le31.imgW === 400, `Le 31 : image 31.webp peinte (${le31.imgSrc}, ${le31.imgW})`);
check(le31.thumbs === 2, `Le 31 : 2 vignettes (${le31.thumbs})`);
check(
  JSON.stringify(le31.formats.map((f) => f.prix)) === JSON.stringify([5.5, 15.5, 26]),
  `Le 31 : palier 5.50 / 15.50 / 26.00 (${le31.formats.map((f) => f.prix).join(', ')})`,
);
await s.page.screenshot({ path: 'verify/captures/le31-detail.png', fullPage: true });
await s.page.locator('#thumbnail-container .thumbnail').nth(1).click();
await settle(s.page);
const img2 = await s.page.evaluate(() => document.getElementById('Goukie-main-img')?.getAttribute('src'));
check(img2?.endsWith('goukie_images/31-2.webp'), `Le 31 : 2e image = 31-2.webp (${img2})`);

// -- 2b) Temoin : une fiche avec ingredients garde son bloc visible (le masquage ne deborde pas)
const le67 = await lireFiche('le-67');
check(le67.blocVisible && le67.ingredients.length === 5, `Le 67 : bloc ingredients visible, 5 items (${le67.ingredients.length})`);

// -- 2c) Geant Insolites
const geantFiche = await lireFiche('geant-insolites');
check(geantFiche.imgSrc === 'goukie_images/geant-insolites.webp' && geantFiche.imgW === 400, `fiche Geant Insolites : nouvelle photo (${geantFiche.imgSrc})`);
await s.page.screenshot({ path: 'verify/captures/fiche-geant-insolites.png' });

// -- 2d) Epicerie : 5 produits a 6.50
const EPICES = 'Épices bio (cannelle, gingembre, muscade, piment de la Jamaïque et girofle)';
const attendu = {
  'apple-butter': { img: 'apple_butter.webp', ingr: ['Pommes bio', 'Sucre de canne blond bio', "Sirop d'érable", EPICES],
    prov: 'Les pommes bio proviennent de La Pommeraie de Chaussoy-Epagny' },
  'pumpkin-butter': { img: 'pumpkin_butter.webp', ingr: ['Courge bio', "Sirop d'érable", 'Sucre muscovado bio', EPICES],
    prov: "Les courges bio proviennent de La ferme de l'horizon à Saint-Leu d'Esserent" },
  'pear-butter': { img: 'pear_butter.webp', ingr: ['Poires bio', 'Sucre muscovado bio', 'Épices bio (cardamome et clous de girofle)'],
    prov: 'Les poires bio proviennent de La Pommeraie de Chaussoy-Epagny', desc: /cardamome.*Les pots font 220 ml\.$/ },
  'almond-butter': { img: 'almond_butter.webp', ingr: ['Amandes bio'], prov: null, desc: /^Un beurre d'amande artisanal, préparé avec des ingrédients 100 % bio, pour savourer toute la douceur de l'amande\.$/ },
  'peanut-butter': { img: 'peanut_butter.webp', ingr: ['Cacahuètes bio'], prov: null, desc: /^Un beurre de cacahuète artisanal, composé à 100 % de cacahuètes bio, pour retrouver toute leur saveur dans une cuillère gourmande\.$/ },
};
// Texte des cards de epicerie.html, lu avant les fiches pour comparer les descriptifs.
await gotoWithRetry(s.page, `${srv.baseUrl}/epicerie.html`, () => !!document.querySelector('#epicerie .Goukie-card'));
const cartesTexte = Object.fromEntries(await s.page.$$eval('#epicerie .Goukie-card', (els) =>
  els.map((a) => [a.getAttribute('href').split('id=')[1], a.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim()])));
for (const [id, a] of Object.entries(attendu)) {
  const f = await lireFiche(id);
  console.log(`DETAIL ${id} =>`, JSON.stringify({ ...f, desc: f.desc?.slice(0, 60) }));
  const prix = saboter(f.formats, [{ label: 'Pot', prix: 6 }]);
  check(prix.length === 1 && prix[0].label === 'Pot' && prix[0].prix === 6.5, `${id} : Pot a 6.50 (${JSON.stringify(prix)})`);
  check(JSON.stringify(f.ingredients) === JSON.stringify(a.ingr), `${id} : ingredients (${f.ingredients.join(' | ')})`);
  check(saboter(f.provenance, 'Les x proviennent de : y') === a.prov, `${id} : carte provenance (${f.provenance})`);
  check(f.imgSrc === `goukie_images/${a.img}` && f.imgW > 0, `${id} : photo ${a.img} peinte (${f.imgSrc}, ${f.imgW})`);
  if (a.desc) check(a.desc.test(saboter(f.desc || '', '100% bio')), `${id} : descriptif`);
  // Pear : la card ne reprend que la 1re phrase (comme Apple / Pumpkin) ; Almond / Peanut : texte entier.
  if (['almond-butter', 'peanut-butter'].includes(id)) {
    check(a.desc.test(saboter(cartesTexte[id] || '', '100% bio.')), `${id} : meme descriptif sur la card epicerie`);
  }
  check(f.blocVisible, `${id} : bloc ingredients visible`);
  await s.page.screenshot({ path: `verify/captures/fiche-${id}.png` });
}

// -- 2e) Page epicerie : 5 cards, photos peintes
await gotoWithRetry(s.page, `${srv.baseUrl}/epicerie.html`, () => !!document.querySelector('#epicerie .Goukie-card'));
await settle(s.page);
const cartesEpi = saboter(
  await s.page.$$eval('#epicerie .Goukie-card', (els) => els.map((a) => ({
    href: a.getAttribute('href'), natW: a.querySelector('img')?.naturalWidth || 0,
  }))),
  [],
);
console.log('EPICERIE', JSON.stringify(cartesEpi));
check(
  JSON.stringify(cartesEpi.map((c) => c.href.split('id=')[1])) === JSON.stringify(Object.keys(attendu)),
  `epicerie : 5 cards dans l'ordre (${cartesEpi.map((c) => c.href.split('id=')[1]).join(', ')})`,
);
check(cartesEpi.length === 5 && cartesEpi.every((c) => c.natW > 0), 'epicerie : 5 photos peintes');
await s.page.locator('#epicerie').screenshot({ path: 'verify/captures/epicerie-novembre.png' });

// ============================================================ 3) CONSOLE
check(s.consoleErrors.length === 0, `0 erreur console (${s.consoleErrors.length})`);
if (s.consoleErrors.length) console.log('CONSOLE ERRORS', JSON.stringify(s.consoleErrors, null, 2));

await s.close();
srv.stop();
done();
