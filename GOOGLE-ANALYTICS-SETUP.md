# 📊 Installation Google Analytics 4 - Les 100 Goukies

## ✅ Étapes Complètes d'Installation

### Étape 1 : Créer votre compte Google Analytics

1. **Allez sur** : https://analytics.google.com
2. **Connectez-vous** avec votre compte Google
3. **Cliquez sur** "Commencer à mesurer"
4. **Remplissez** :
   - Nom du compte : "Les 100"
   - Nom de la propriété : "Les 100 Goukies"
   - Fuseau horaire : "France"
   - Devise : "Euro (EUR)"
5. **Configurez le flux de données** :
   - Sélectionnez "Web"
   - URL du site : `https://les100goukies.com`
   - Nom du flux : "Site Les 100"
6. **Copiez votre ID de mesure** : `G-XXXXXXXXXX`

---

### Étape 2 : Ajouter le code dans vos pages HTML

#### Code à copier dans TOUTES vos pages HTML

Ajoutez ce code **dans la balise `<head>`**, **juste après le Google Tag Manager existant** (ligne 25 dans index.html) :

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-VOTRE-ID-ICI"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // Mode consentement par défaut (RGPD)
  gtag('consent', 'default', {
    'analytics_storage': 'denied'
  });

  gtag('config', 'G-VOTRE-ID-ICI', {
    'anonymize_ip': true,
    'allow_google_signals': false
  });
</script>
<!-- End Google Analytics 4 -->
```

**⚠️ IMPORTANT** : Remplacez `G-VOTRE-ID-ICI` par votre vrai ID de mesure (2 fois dans le code).

---

### Étape 3 : Ajouter le code dans script.js

**✅ DÉJÀ FAIT !** J'ai déjà ajouté :
- Module `Analytics` (lignes 1027-1167)
- Module `CookieConsent` (lignes 1169-1354)
- Initialisation automatique (lignes 1000-1001)

**Cependant, vous devez mettre à jour votre ID :**

Ouvrez `script.js` et allez à la ligne **1033** :

```javascript
measurementId: 'G-XXXXXXXXXX', // À remplacer par votre vrai ID
```

Remplacez `G-XXXXXXXXXX` par votre vrai ID de mesure.

---

### Étape 4 : Liste des fichiers à modifier

Voici la liste des fichiers HTML où ajouter le code Google Analytics :

1. ✅ `index.html` (page d'accueil)
2. ✅ `Goukie.html` (catalogue)
3. ✅ `Goukie-detail.html` (détail produit)
4. ✅ `histoire.html` (page histoire)
5. ✅ `contact.html` (page contact)
6. ✅ `merci.html` (page merci)
7. ❓ `page_secrète.html` (optionnel)

---

### Étape 5 : Vérifier que ça fonctionne

#### Méthode 1 : Console du navigateur
1. Ouvrez votre site en navigation privée
2. Ouvrez la console (F12 → Console)
3. Vous devriez voir la bannière cookies apparaître
4. Cliquez sur "Accepter"
5. Dans la console, tapez : `gtag` → Devrait afficher une fonction

#### Méthode 2 : Google Analytics Real-Time
1. Allez sur Google Analytics
2. Cliquez sur "Rapports" → "Temps réel"
3. Ouvrez votre site dans un autre onglet
4. Vous devriez voir "1 utilisateur actif" dans GA4

#### Méthode 3 : Extension Chrome "Google Analytics Debugger"
1. Installez l'extension "Google Analytics Debugger"
2. Activez-la
3. Ouvrez la console F12
4. Rechargez votre site
5. Vous verrez tous les événements envoyés à GA4

---

## 🎯 Événements Trackés Automatiquement

Une fois installé, votre site trackera automatiquement :

### Événements standards
- ✅ **`page_view`** : Chaque page visitée
- ✅ **`add_to_cart`** : Ajout d'un produit au panier
- ✅ **`view_item`** : Clic sur une carte produit
- ✅ **`filter_catalog`** : Utilisation des filtres catalogue
- ✅ **`click_external_link`** : Clic sur un lien externe

### Données collectées par page
- Page visitée (URL)
- Titre de la page
- Temps passé
- Provenance (Google, Facebook, direct, etc.)
- Appareil (mobile, desktop, tablette)
- Navigateur
- Pays/Ville

### Données e-commerce
- Produits ajoutés au panier
- Prix des produits
- Catégories de produits
- IDs des produits

---

## 📊 Comment Voir Vos Statistiques

### Dashboard Google Analytics 4

**URL** : https://analytics.google.com

**Sections importantes** :

1. **Rapports → Temps réel**
   - Visiteurs actuellement sur le site
   - Pages consultées en ce moment

2. **Rapports → Acquisition → Vue d'ensemble**
   - D'où viennent vos visiteurs
   - Trafic organique (Google Search)
   - Trafic social (Facebook, Instagram)
   - Trafic direct

3. **Rapports → Engagement → Pages et écrans**
   - Pages les plus visitées
   - Temps moyen par page
   - Taux de rebond

4. **Rapports → Engagement → Événements**
   - Tous les événements personnalisés
   - Nombre d'ajouts au panier
   - Filtres utilisés
   - Clics sur produits

5. **Rapports → Technologie → Vue d'ensemble**
   - Appareils utilisés (mobile vs desktop)
   - Navigateurs
   - Systèmes d'exploitation

6. **Rapports → Données démographiques**
   - Pays des visiteurs
   - Langues

---

## 🍪 Bannière de Consentement Cookies

### Comment ça marche

1. **Première visite** : La bannière apparaît en bas de l'écran
2. **Accepter** : Google Analytics est activé, les données sont collectées
3. **Refuser** : Google Analytics reste désactivé, aucune donnée collectée
4. **Mémorisation** : Le choix est enregistré dans le navigateur (localStorage)

### Réinitialiser le consentement (pour tester)

Ouvrez la console F12 et tapez :
```javascript
localStorage.removeItem('cookieConsent');
location.reload();
```

---

## 🔒 Conformité RGPD

Votre installation est **conforme RGPD** car :

✅ Consentement demandé avant activation
✅ Anonymisation des IP activée
✅ Possibilité de refuser
✅ Choix mémorisé
✅ Google Signals désactivé (pas de remarketing)

---

## 🛠️ Personnalisation

### Modifier le texte de la bannière

Éditez `script.js`, ligne **1192** :

```javascript
<p>
  🍪 Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic du site.
</p>
```

### Ajouter un nouvel événement personnalisé

Exemple : Tracker les clics sur le bouton "Nous trouver"

```javascript
document.querySelector('#btn-trouver').addEventListener('click', () => {
  Analytics.trackEvent('click_nous_trouver', {
    button_location: 'footer'
  });
});
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez la console** : F12 → Console → Rechercher "gtag"
2. **Vérifiez l'ID** : L'ID de mesure doit être identique dans HTML et script.js
3. **Attendez 24-48h** : Les données peuvent mettre du temps à s'afficher
4. **Mode navigation privée** : Testez toujours en navigation privée pour éviter les bloqueurs de pub

---

## ✅ Checklist d'Installation

- [ ] Créer le compte Google Analytics
- [ ] Copier l'ID de mesure (G-XXXXXXXXXX)
- [ ] Remplacer l'ID dans script.js (ligne 1033)
- [ ] Ajouter le code GA4 dans toutes les pages HTML (voir liste ci-dessus)
- [ ] Tester en navigation privée
- [ ] Vérifier "Temps réel" dans Google Analytics
- [ ] Accepter les cookies et vérifier que les événements sont envoyés
- [ ] Commit et push sur GitHub

---

**Créé le** : 2025-01-05
**Status** : Prêt à déployer ✅
