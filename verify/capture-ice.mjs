// Capture fidele de la grille Ice Goukies : les cartes sont revelees par un
// reveal GSAP au scroll (opacity 0 au repos). On scrolle la section dans le
// viewport pour declencher le reveal reel (comportement livre), avec repli
// force-opacity si le ScrollTrigger ne mord pas en headless.
import { startPreview, launchPage, settle } from '/home/matteo_linux/projets/.claude/verify-kit/harness.mjs';

const srv = await startPreview({ command: 'python3 -m http.server {port}' });
const s = await launchPage({ device: 'desktop' });
await s.page.goto(`${srv.baseUrl}/Goukie.html`, { waitUntil: 'networkidle' });

const opacityBefore = await s.page.$$eval('#ice-goukie .Goukie-card', (cs) =>
  cs.map((c) => parseFloat(getComputedStyle(c).opacity)),
);
console.log('opacity cartes AVANT scroll:', JSON.stringify(opacityBefore));

// Declencher le reveal comme un utilisateur : amener la section dans le viewport
await s.page.evaluate(() => document.querySelector('#ice-goukie').scrollIntoView({ block: 'center' }));
await s.page.mouse.wheel(0, 60);
await s.page.waitForTimeout(200);
await s.page.mouse.wheel(0, -60);

let revealed = false;
try {
  await s.page.waitForFunction(
    () => {
      const cs = [...document.querySelectorAll('#ice-goukie .Goukie-card')];
      return cs.length === 3 && cs.every((c) => parseFloat(getComputedStyle(c).opacity) > 0.98);
    },
    null,
    { timeout: 6000 },
  );
  revealed = true;
  console.log('REVEAL declenche au scroll (comportement livre confirme)');
} catch {
  console.log('reveal NON declenche en headless -> force opacity pour juger le CONTENU (images)');
  await s.page.evaluate(() =>
    document.querySelectorAll('#ice-goukie .Goukie-card').forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    }),
  );
}

const opacityAfter = await s.page.$$eval('#ice-goukie .Goukie-card', (cs) =>
  cs.map((c) => parseFloat(getComputedStyle(c).opacity)),
);
console.log('opacity cartes APRES:', JSON.stringify(opacityAfter), '| revealed=', revealed);

await settle(s.page);
await s.page.locator('#ice-goukie').scrollIntoViewIfNeeded();
await s.page.locator('#ice-goukie').screenshot({ path: 'verify/captures/ice-grid.png' });
console.log('capture ecrite : verify/captures/ice-grid.png');

await s.close();
srv.stop();
process.exit(0);
