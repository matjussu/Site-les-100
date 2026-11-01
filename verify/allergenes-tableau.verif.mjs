// Verif-kit v2 - ordre 2026-11-01-1805 : tableau des allergenes remplace par la
// version posee par Matteo le 01/11 (Tableau_allergene.png, 966x597), au meme
// chemin image/allergènes_tableau.png reference par allergenes.html.
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
const s = await launchPage({ device: 'desktop', reducedMotion: 'reduce' });
await gotoWithRetry(s.page, `${srv.baseUrl}/allergenes.html`, () => !!document.querySelector('.allergenes-img'));
await settle(s.page);

const img = await s.page.$eval('.allergenes-img', (i) => ({
  src: i.getAttribute('src'), natW: i.naturalWidth, natH: i.naturalHeight,
  w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height),
}));
console.log('TABLEAU', JSON.stringify(img));
const m = saboter(img, { ...img, natW: 1406, natH: 627 });
check(m.src === 'image/allergènes_tableau.png', `src inchange (${m.src})`);
check(m.natW === 966 && m.natH === 597, `nouvelle version chargee, 966x597 (${m.natW}x${m.natH})`);
check(m.w > 0 && m.h > 0, `tableau affiche (${m.w}x${m.h})`);
// La banniere cookies (fixe) recouvre le bas du tableau : masquee pour la capture seulement.
await s.page.addStyleTag({ content: '#cookie-consent-banner { display: none !important; }' });
await s.page.locator('.allergenes-img').screenshot({ path: 'verify/captures/allergenes-tableau.png' });
check(saboter(s.consoleErrors.length, 1) === 0, `0 erreur console (${s.consoleErrors.length})`);

await s.close();
srv.stop();
done();
