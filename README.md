# Site Les 100 - Goukies Artisanales

Site web officiel de **Les 100**, boulangerie artisanale spécialisée dans les Goukies (cookies) sans gluten, sans œufs et sans lactose.

![Version](https://img.shields.io/badge/version-2.0.0-orange)
![Statut](https://img.shields.io/badge/statut-production-green)

## 🍪 À propos

Les 100 propose des Goukies artisanales bio, disponibles chaque dimanche au marché de Gouvieux. Ce site présente notre catalogue de produits, notre histoire, et permet de découvrir nos créations mensuelles en édition limitée.

**Caractéristiques principales :**
- 🌾 100% sans gluten
- 🥚 Sans œufs
- 🥛 Sans lactose
- 🌱 Ingrédients bio et locaux
- 💚 Fait maison avec amour

## 🌐 Site web

**URL de production :** [www.les-100.fr](https://www.les-100.fr)

**Plateforme d'hébergement :** GitHub Pages

## 📁 Structure du projet

```
Site-les-100/
├── index.html              # Page d'accueil
├── Goukie.html             # Catalogue de produits
├── Goukie-detail.html      # Page de détail produit
├── histoire.html           # Notre histoire
├── contact.html            # Formulaire de contact
├── merci.html              # Page de remerciement
├── styles.css              # Feuille de style principale
├── script.js               # JavaScript principal (refactorisé)
├── Goukie-detail.js        # Logique des pages produits
├── contact.js              # Gestion du formulaire
├── Goukies.json            # Base de données produits
├── sw.js                   # Service Worker (PWA)
├── sitemap.xml             # Plan du site pour SEO
├── robot.txt               # Directives robots
├── CNAME                   # Configuration domaine personnalisé
├── cache.htaccess          # Configuration cache Apache
├── logo/                   # Assets de la marque
├── image/                  # Images générales
└── goukie_images/          # Photos de produits
```

## 🛠️ Technologies utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Grid, Flexbox, animations
- **JavaScript ES6+** - Logique modulaire

### Bibliothèques externes
- **GSAP 3.12.5** - Animations professionnelles
  - ScrollTrigger plugin pour effets au scroll
  - Timeline pour séquences d'animation
- **Google Fonts** - Poppins & Playfair Display

### Services tiers
- **Google Analytics 4** (G-W677K39BJN) - Mesure d'audience (Consent Mode RGPD)
- **FormSubmit** - Gestion des formulaires de contact
- **Instagram** - Intégration réseaux sociaux (@les100_gluten_oeuf_lactose)

### PWA
- Service Worker avec stratégie de cache
- Fonctionnement hors ligne
- Installation sur écran d'accueil

## 🚀 Installation & Développement

### Prérequis
- Navigateur web moderne
- (Optionnel) Serveur local pour le développement

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/Site-les-100.git

# Accéder au dossier
cd Site-les-100

# Ouvrir avec un serveur local (exemple avec Python)
python -m http.server 8000

# Ou avec Node.js
npx serve
```

Accéder à `http://localhost:8000` dans votre navigateur.

### Mode développement

Aucune compilation nécessaire ! Le site est entièrement statique. Modifiez les fichiers HTML/CSS/JS et rechargez la page.

## 📦 Structure des données

### Format des produits (Goukies.json)

```json
{
  "id": "le-11",
  "nom": "Le 11",
  "description": "Nature aux pépites de chocolat",
  "images": [
    "goukie_images/le-11-01.webp",
    "goukie_images/le-11-2.webp"
  ],
  "categorie": "essentiels",
  "ingredients": [
    "Farine de riz Bio",
    "Sucre de canne blond Bio",
    "Compote de pomme bio fait maison"
  ],
  "prix": {
    "petit": 2.50,
    "moyen": 4.50,
    "grand": null
  },
  "format_mini": { "unite": 2.50, "x6": 12.50 },
  "format_standard": { "unite": 4.50, "x4": 16.00 },
  "format_gourmet": { "unite": 5.00, "x3": 14.00 },
  "format_geant": { "parts_4_6": 36.00 }
}
```

### Catégories disponibles
- `essentiels` - Goukies de base
- `gourmets` - Recettes premium
- `mini` - Formats réduits
- `edition_limitee` - Créations mensuelles

## 🎨 Architecture du code

### JavaScript modulaire (script.js)

Le code a été refactorisé en modules pour une meilleure maintenabilité :

```javascript
// Utilitaires globaux
utils: { isMobile, isHistoirePage, debounce }

// Modules principaux
MobileMenu:          // Gestion menu hamburger (UNIQUE, plus de duplication)
PageAnimations:      // Animations GSAP
PageLoader:          // Loader de chargement
Cart:                // Système de panier
HistoirePage:        // Animations page histoire
GoukieOfTheMonth:    // Gestion Goukie du mois
MobileOptimizations: // Performance mobile
```

### Système de panier

```javascript
// Ajouter au panier
Cart.addToCart({
  id: 'le-11',
  nom: 'Le 11',
  taille: 'moyen',
  prix: 4.50,
  quantity: 2,
  image: 'goukie_images/le-11-01.webp'
}, event);

// Afficher le panier
Cart.showModal();
```

### Animations

```javascript
// Animations au scroll
ScrollTrigger.create({
  trigger: '.Goukie-card',
  start: 'top 85%',
  animation: gsap.from(card, { opacity: 0, y: 60 })
});
```

## 📱 Responsive Design

Le site est entièrement responsive avec 3 breakpoints :

- **Mobile** : ≤ 768px
- **Tablet** : > 768px et ≤ 1024px
- **Desktop** : > 1024px

### Optimisations mobiles automatiques
- Désactivation des animations parallaxe
- Lazy loading des images
- Simplification des ScrollTriggers
- Menu hamburger adapté

## 🔧 Fonctionnalités

### Panier virtuel
- Ajout/suppression de produits
- Gestion des quantités
- Calcul automatique du total
- Persistance dans localStorage
- Animation d'ajout au panier

**Note :** Le panier est uniquement informatif. Les ventes se font physiquement au marché de Gouvieux.

### Goukie du mois
Chaque mois, un nouveau Goukie en édition limitée est mis en avant :
- Badge sur la page d'accueil
- Bannière sur le catalogue
- Ruban spécial dans la grille

Pour changer le Goukie du mois, modifier dans [script.js:839-845](script.js#L839-L845) :

```javascript
const GoukieOfTheMonth = {
  data: {
    id: "novembre",
    nom: "Novembre - Crumble Amande",
    description: "...",
    image: "goukie_images/le-novembre-1.webp"
  }
};
```

### Formulaire de contact
- Sujet multiple (commandes, infos, partenariats)
- Validation côté client
- Envoi via FormSubmit
- Redirection vers page de remerciement

## 🔍 SEO

### Meta tags optimisés
- Open Graph pour Facebook
- Twitter Cards
- URL canoniques
- Description et keywords

### Sitemap XML
Fichier `sitemap.xml` avec :
- Toutes les pages principales
- Fréquences de mise à jour
- Priorités relatives

### Performances
- Préchargement des ressources critiques
- Images au format WebP
- Lazy loading
- Cache via Service Worker
- Preconnect aux domaines externes

## 🚢 Déploiement

### GitHub Pages

Le site est automatiquement déployé sur GitHub Pages à chaque push sur la branche `main`.

```bash
# Pousser les modifications
git add .
git commit -m "Description des modifications"
git push origin main
```

Le site sera mis à jour automatiquement en quelques minutes sur [www.les-100.fr](https://www.les-100.fr).

### Configuration du domaine personnalisé

Le fichier `CNAME` contient :
```
www.les-100.fr
```

**Configuration DNS requise :**
```
Type: CNAME
Host: www
Value: votre-username.github.io
```

## 📊 Analytics

Google Analytics 4 est configuré avec l'ID de mesure `G-W677K39BJN`, installé dans
le `<head>` de toutes les pages HTML.

- **Consent Mode (RGPD)** : `analytics_storage` est `denied` par défaut. Une bannière
  cookies (`CookieConsent` dans `script.js`) le passe à `granted` si le visiteur
  accepte. Tant que le visiteur n'a pas accepté, GA4 envoie des pings sans cookie
  (le trafic est mesuré, mais les visiteurs uniques ne sont pas dédupliqués).
- **Événements custom** (module `Analytics` dans `script.js`) : `add_to_cart`,
  `view_item`, `filter_catalog`, `click_external_link`.
- **Page vue** : envoyée automatiquement par `gtag('config', …)`. Ne pas la
  ré-émettre manuellement (cela créerait un double comptage).

Pour consulter les statistiques, accéder à [Google Analytics](https://analytics.google.com)
→ propriété `G-W677K39BJN`.

## 🐛 Debug & Résolution de problèmes

### Le loader ne disparaît pas
**Cause :** Images ne se chargent pas
**Solution :** Vérifier les chemins dans Goukies.json

### Menu hamburger ne fonctionne pas
**Cause :** JavaScript non chargé ou erreur
**Solution :** Ouvrir la console navigateur (F12) et vérifier les erreurs

### Panier ne persiste pas
**Cause :** localStorage désactivé
**Solution :** Vérifier les paramètres de confidentialité du navigateur

### Animations saccadées sur mobile
**Cause :** GPU surchargé
**Solution :** Les optimisations mobiles sont automatiques, vérifier la fonction `MobileOptimizations.init()`

## 🔐 Sécurité

### Bonnes pratiques appliquées
- ✅ Aucun secret en code dur
- ✅ HTTPS activé via GitHub Pages
- ✅ FormSubmit pour éviter l'exposition d'email
- ✅ Validation des entrées utilisateur
- ✅ Pas de dépendances vulnérables

### Recommandations
- L'email dans contact.html est visible dans le code source (FormSubmit)
- Considérer un backend pour traiter les formulaires si nécessaire

## 📝 Guide de contribution

### Ajouter un nouveau Goukie

1. Ajouter les images dans `goukie_images/`
2. Ajouter l'entrée dans `Goukies.json` :

```json
{
  "id": "nouveau-goukie",
  "nom": "Nom du Goukie",
  "description": "Description...",
  "images": ["goukie_images/nouveau-1.webp"],
  "categorie": "essentiels",
  "ingredients": [...],
  "prix": {...}
}
```

3. Tester localement
4. Commit et push

### Modifier les styles

1. Éditer `styles.css`
2. Utiliser les variables CSS existantes pour la cohérence :
```css
:root {
  --primary-color: #f8660e;
  --text-color: #3c2b1a;
  --bg-color: #f4f4f4;
}
```

### Conventions de code

- **Indentation :** 2 espaces
- **Nommage JS :** camelCase
- **Nommage CSS :** kebab-case
- **Commits :** Messages descriptifs en français

```bash
✅ git commit -m "Ajout du Goukie de décembre"
✅ git commit -m "Correction du bug du panier sur iOS"
❌ git commit -m "fix"
```

## 📞 Contact

- **Email :** sophie.les100@gmail.com
- **Instagram :** [@les100_gluten_oeuf_lactose](https://instagram.com/les100_gluten_oeuf_lactose)
- **Marché :** Gouvieux, tous les dimanches matin

## 📄 Licence

© 2024 Les 100. Tous droits réservés.

---

## 🎯 Changelog

### Version 2.0.0 (2025-01)
- ♻️ **Refactoring majeur du JavaScript**
  - Réduction de 60% du code (1534 → ~1000 lignes)
  - Élimination de la duplication (4 initialisations menu → 1)
  - Architecture modulaire avec objets
  - Suppression de tous les console.log
  - Amélioration de la gestion des event listeners
  - Ajout de gestion d'erreurs

- 🐛 **Corrections de bugs**
  - Fix typo "Compte de pomme" → "Compote de pomme"
  - Standardisation "image" vs "images" dans JSON
  - Correction des fuites mémoire potentielles

- 📚 **Documentation**
  - README complet ajouté
  - Code commenté et structuré
  - Guide de contribution

### Version 1.0.0 (2024)
- 🎉 Lancement initial du site
- 🍪 Catalogue de produits complet
- 🛒 Système de panier
- 📱 Design responsive
- ⚡ Animations GSAP
- 🔄 PWA avec Service Worker

---

**Fait avec ❤️ et 🍪 par Les 100**
