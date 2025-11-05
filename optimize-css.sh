#!/bin/bash

# ==========================================
# Script d'Optimisation CSS - Site Les 100
# ==========================================

set -e  # Arrêter en cas d'erreur

echo "🎨 Optimisation CSS - Site Les 100"
echo "=================================="
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifications préalables
if [ ! -f "styles.css" ]; then
    echo -e "${RED}❌ Erreur: styles.css introuvable${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Analyse du fichier actuel...${NC}"
ORIGINAL_SIZE=$(wc -c < styles.css)
ORIGINAL_LINES=$(wc -l < styles.css)
IMPORTANT_COUNT=$(grep -o "!important" styles.css | wc -l)

echo "   Taille: $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE)"
echo "   Lignes: $ORIGINAL_LINES"
echo "   !important: $IMPORTANT_COUNT occurrences"
echo ""

# Backup
echo -e "${YELLOW}💾 Création du backup...${NC}"
cp styles.css styles.css.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}   ✓ Backup créé${NC}"
echo ""

# Option 1: Optimisation rapide (sans outils externes)
echo -e "${YELLOW}🔧 Optimisation rapide (sans dépendances)...${NC}"

# Créer un fichier temporaire
cp styles.css styles-temp.css

# 1. Remplacer les couleurs par des variables
echo "   → Remplacement des couleurs par variables CSS..."
sed -i 's/#f8660e/var(--color-primary)/g' styles-temp.css
sed -i 's/#3c2b1a/var(--color-text)/g' styles-temp.css
sed -i 's/#f4f4f4/var(--color-bg)/g' styles-temp.css
sed -i 's/#ffffff/var(--color-bg-white)/g' styles-temp.css
echo -e "${GREEN}   ✓ Variables de couleurs appliquées${NC}"

# 2. Supprimer les !important les moins critiques
echo "   → Suppression des !important non critiques..."
# Opacité
sed -i 's/opacity: 1 !important;/opacity: 1;/g' styles-temp.css
sed -i 's/opacity: 0 !important;/opacity: 0;/g' styles-temp.css
# Visibilité
sed -i 's/visibility: visible !important;/visibility: visible;/g' styles-temp.css
sed -i 's/visibility: hidden !important;/visibility: hidden;/g' styles-temp.css
# Display basique
sed -i 's/display: block !important;/display: block;/g' styles-temp.css
sed -i 's/display: flex !important;/display: flex;/g' styles-temp.css
sed -i 's/display: none !important;/display: none;/g' styles-temp.css

NEW_IMPORTANT_COUNT=$(grep -o "!important" styles-temp.css | wc -l)
REMOVED_IMPORTANT=$((IMPORTANT_COUNT - NEW_IMPORTANT_COUNT))
echo -e "${GREEN}   ✓ $REMOVED_IMPORTANT occurrences de !important supprimées${NC}"

# 3. Ajouter les variables CSS au début
echo "   → Ajout des variables CSS..."
if [ -f "css-variables.css" ]; then
    cat css-variables.css styles-temp.css > styles-optimized.css
    echo -e "${GREEN}   ✓ Variables CSS ajoutées${NC}"
else
    mv styles-temp.css styles-optimized.css
    echo -e "${YELLOW}   ⚠ css-variables.css non trouvé, variables non ajoutées${NC}"
fi

rm -f styles-temp.css

# Statistiques finales
echo ""
echo -e "${GREEN}✅ Optimisation terminée !${NC}"
echo ""
echo "📊 Résultats:"
echo "   Fichier original: styles.css"
echo "   Fichier optimisé: styles-optimized.css"
echo ""

OPTIMIZED_SIZE=$(wc -c < styles-optimized.css)
OPTIMIZED_LINES=$(wc -l < styles-optimized.css)
OPTIMIZED_IMPORTANT=$(grep -o "!important" styles-optimized.css | wc -l)

echo "   Taille: $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE) → $(numfmt --to=iec-i --suffix=B $OPTIMIZED_SIZE)"
echo "   Lignes: $ORIGINAL_LINES → $OPTIMIZED_LINES"
echo "   !important: $IMPORTANT_COUNT → $OPTIMIZED_IMPORTANT (-$REMOVED_IMPORTANT)"
echo ""

# Minification (si cssnano est disponible)
if command -v cssnano &> /dev/null; then
    echo -e "${YELLOW}🗜️  Minification avec cssnano...${NC}"
    cssnano styles-optimized.css styles.min.css
    MINIFIED_SIZE=$(wc -c < styles.min.css)
    echo -e "${GREEN}   ✓ Fichier minifié créé: styles.min.css${NC}"
    echo "   Taille minifiée: $(numfmt --to=iec-i --suffix=B $MINIFIED_SIZE)"

    SAVINGS_PERCENT=$(( 100 - (MINIFIED_SIZE * 100 / ORIGINAL_SIZE) ))
    echo -e "${GREEN}   📉 Réduction de ${SAVINGS_PERCENT}%${NC}"
else
    echo -e "${YELLOW}⚠️  cssnano non installé. Pas de minification.${NC}"
    echo "   Pour installer: npm install -g cssnano-cli"
fi

echo ""
echo -e "${GREEN}🎉 Optimisation réussie !${NC}"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Tester le site avec styles-optimized.css"
echo "   2. Si tout fonctionne, remplacer styles.css"
echo "   3. Commit les changements"
echo ""
echo "💡 Commandes de test:"
echo "   # Temporairement, renommer dans index.html:"
echo "   sed -i 's/styles.css/styles-optimized.css/g' *.html"
echo ""
echo "   # Lancer serveur local:"
echo "   python -m http.server 8000"
echo ""
echo "   # Si tout fonctionne:"
echo "   mv styles.css styles.css.old"
echo "   mv styles-optimized.css styles.css"
echo ""
