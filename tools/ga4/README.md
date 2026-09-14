# Reporting GA4 — site Les 100

Outil local pour interroger directement les chiffres d'audience GA4
(`www.les-100.fr`, propriété de mesure `G-W677K39BJN`) en ligne de commande.

Authentification par **compte de service** (identité robot dédiée, lecture seule).
Note : la voie « identifiants utilisateur » (ADC) ne marche plus — Google bloque
le scope `analytics.readonly` sur le client OAuth par défaut de gcloud.

## Setup (une seule fois)

Lance ces commandes dans le terminal (préfixe `! ` si tu es dans Claude Code).

**1. Activer les APIs Analytics (déjà fait) :**
```bash
gcloud services enable analyticsdata.googleapis.com analyticsadmin.googleapis.com
```

**2. Créer le compte de service + sa clé :**
```bash
gcloud iam service-accounts create ga4-reader \
  --display-name="GA4 Reader Les100" --project=matjussujarvis

gcloud iam service-accounts keys create tools/ga4/sa-key.json \
  --iam-account=ga4-reader@matjussujarvis.iam.gserviceaccount.com
```

**3. Donner accès à ce compte sur la propriété GA4 (dans l'interface) :**
- [analytics.google.com](https://analytics.google.com) → ⚙️ Admin → *Gestion des
  accès à la propriété* → bouton **+** → *Ajouter des utilisateurs*
- E-mail : `ga4-reader@matjussujarvis.iam.gserviceaccount.com`
- Rôle : **Lecteur (Viewer)** — décoche « Avertir par e-mail » (un robot n'a pas
  de boîte mail)

**4. Trouver l'ID de propriété et l'enregistrer :**
```bash
cd tools/ga4
./.venv/bin/python ga4.py properties          # affiche l'ID numérique
echo "TON_ID_NUMERIQUE" > property.txt          # ex: 123456789
```

## Usage quotidien

```bash
cd tools/ga4
./.venv/bin/python ga4.py monthly --months 12   # visiteurs/mois + tendance
./.venv/bin/python ga4.py summary --days 30      # résumé + top pages + sources
```

L'`ID de propriété` (numérique) est différent de l'`ID de mesure`
`G-W677K39BJN` qui est dans le code du site.
