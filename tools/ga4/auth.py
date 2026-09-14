#!/usr/bin/env python3
"""
Authentification OAuth (une seule fois) pour le reporting GA4.

Utilise TON client OAuth dédié (oauth-client.json, téléchargé depuis la console
Google Cloud) + ton compte Google qui possède déjà la propriété GA4.
Ouvre le navigateur, tu acceptes, et le jeton est sauvegardé dans token.json.
Ensuite ga4.py réutilise ce jeton et le rafraîchit tout seul.

  python3 auth.py
"""
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

HERE = Path(__file__).parent
CLIENT_FILE = HERE / "oauth-client.json"
TOKEN_FILE = HERE / "token.json"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]


def main():
    if not CLIENT_FILE.exists():
        raise SystemExit(
            f"❌ {CLIENT_FILE} introuvable.\n"
            "   Télécharge le client OAuth (type 'Application de bureau') depuis\n"
            "   la console Google Cloud et enregistre-le sous ce nom."
        )
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_FILE), SCOPES)
    creds = flow.run_local_server(port=0)
    TOKEN_FILE.write_text(creds.to_json())
    print(f"✓ Authentifié. Jeton enregistré dans {TOKEN_FILE}")
    print("  Tu peux maintenant lancer : ./.venv/bin/python ga4.py properties")


if __name__ == "__main__":
    main()
