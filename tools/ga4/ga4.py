#!/usr/bin/env python3
"""
Reporting GA4 pour le site Les 100 (www.les-100.fr).

Utilise les Application Default Credentials (ADC) de gcloud — pas de compte de
service, pas de clé JSON à gérer : c'est le compte Google propriétaire de la
propriété GA4 qui lit ses propres données (scope analytics.readonly).

Pré-requis (à faire une seule fois, voir tools/ga4/README.md) :
  1. APIs activées : analyticsdata + analyticsadmin
  2. ADC configuré avec le scope analytics.readonly
  3. ID de propriété renseigné dans tools/ga4/property.txt (ou env GA4_PROPERTY_ID)

Commandes :
  python3 ga4.py properties              # liste les propriétés GA4 accessibles (pour trouver l'ID)
  python3 ga4.py monthly [--months 12]   # visiteurs / sessions par mois + tendance
  python3 ga4.py summary [--days 30]     # résumé d'une période (users, sessions, vues, top pages, sources)
"""
import argparse
import os
import sys
from pathlib import Path

HERE = Path(__file__).parent
PROPERTY_FILE = HERE / "property.txt"
SA_KEY_FILE = HERE / "sa-key.json"
TOKEN_FILE = HERE / "token.json"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
MEASUREMENT_ID = "G-W677K39BJN"  # rappel : ID de mesure (site) ≠ ID de propriété (API)


def get_credentials():
    """Identifiants, par ordre de préférence :
    1. token.json  -> jeton OAuth utilisateur (créé par auth.py), rafraîchi auto
    2. sa-key.json -> clé de compte de service
    3. ADC par défaut (gcloud)
    """
    if TOKEN_FILE.exists():
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            TOKEN_FILE.write_text(creds.to_json())
        return creds
    if SA_KEY_FILE.exists():
        os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", str(SA_KEY_FILE))
    return None  # None -> les clients utilisent l'ADC par défaut


def get_property_id():
    pid = os.environ.get("GA4_PROPERTY_ID")
    if pid:
        return pid.strip()
    if PROPERTY_FILE.exists():
        val = PROPERTY_FILE.read_text().strip()
        if val:
            return val
    sys.exit(
        "❌ ID de propriété GA4 introuvable.\n"
        "   Lance d'abord :  python3 ga4.py properties\n"
        f"   puis écris l'ID numérique dans {PROPERTY_FILE}\n"
        "   (ou exporte GA4_PROPERTY_ID=123456789)"
    )


def cmd_properties(_args):
    """Liste les comptes + propriétés GA4 accessibles via l'Admin API."""
    from google.analytics.admin import AnalyticsAdminServiceClient

    client = AnalyticsAdminServiceClient(credentials=get_credentials())
    print("Propriétés GA4 accessibles :\n")
    found = False
    for summary in client.list_account_summaries():
        print(f"📁 Compte : {summary.display_name} ({summary.account})")
        for prop in summary.property_summaries:
            found = True
            # property = "properties/123456789" -> on extrait le nombre
            pid = prop.property.split("/")[-1]
            print(f"   └─ {prop.display_name}")
            print(f"      ID de propriété = {pid}   (à mettre dans property.txt)")
    if not found:
        print("Aucune propriété trouvée pour ce compte.")


def _client():
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    return BetaAnalyticsDataClient(credentials=get_credentials())


def cmd_monthly(args):
    """Visiteurs / sessions par mois, sur N mois glissants."""
    from google.analytics.data_v1beta.types import (
        DateRange, Dimension, Metric, RunReportRequest,
    )

    # L'API GA4 n'accepte pas "NmonthsAgo" : on calcule le 1er jour du mois
    # situé (months-1) mois avant le mois courant -> bornes calendaires propres.
    from datetime import date
    today = date.today()
    idx = today.year * 12 + (today.month - 1) - (args.months - 1)
    start = f"{idx // 12:04d}-{idx % 12 + 1:02d}-01"

    pid = get_property_id()
    client = _client()
    req = RunReportRequest(
        property=f"properties/{pid}",
        dimensions=[Dimension(name="yearMonth")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews"),
        ],
        date_ranges=[DateRange(start_date=start, end_date="today")],
        order_bys=[{"dimension": {"dimension_name": "yearMonth"}}],
    )
    resp = client.run_report(req)

    print(f"\n📊 Audience mensuelle — propriété {pid} (site {MEASUREMENT_ID})\n")
    print(f"{'Mois':<10}{'Visiteurs':>12}{'Nouveaux':>12}{'Sessions':>12}{'Vues':>12}{'Évol.':>10}")
    print("-" * 68)
    prev = None
    for row in resp.rows:
        ym = row.dimension_values[0].value  # "202605"
        label = f"{ym[:4]}-{ym[4:]}"
        users = int(row.metric_values[0].value)
        new = int(row.metric_values[1].value)
        sessions = int(row.metric_values[2].value)
        views = int(row.metric_values[3].value)
        if prev is None or prev == 0:
            ev = "—"
        else:
            pct = (users - prev) / prev * 100
            ev = f"{pct:+.0f}%"
        print(f"{label:<10}{users:>12}{new:>12}{sessions:>12}{views:>12}{ev:>10}")
        prev = users
    print("-" * 68)
    print("Visiteurs = utilisateurs actifs. « Évol. » = variation vs mois précédent.\n")


def cmd_summary(args):
    """Résumé d'une période : totaux + top pages + top sources."""
    from google.analytics.data_v1beta.types import (
        DateRange, Dimension, Metric, RunReportRequest,
    )

    pid = get_property_id()
    client = _client()
    dr = [DateRange(start_date=f"{args.days}daysAgo", end_date="today")]

    totals = client.run_report(RunReportRequest(
        property=f"properties/{pid}",
        metrics=[
            Metric(name="activeUsers"), Metric(name="newUsers"),
            Metric(name="sessions"), Metric(name="screenPageViews"),
            Metric(name="averageSessionDuration"), Metric(name="bounceRate"),
        ],
        date_ranges=dr,
    ))
    print(f"\n📊 Résumé — {args.days} derniers jours — propriété {pid}\n")
    if totals.rows:
        v = totals.rows[0].metric_values
        print(f"  Visiteurs (actifs) : {int(v[0].value)}")
        print(f"  Nouveaux visiteurs : {int(v[1].value)}")
        print(f"  Sessions           : {int(v[2].value)}")
        print(f"  Pages vues         : {int(v[3].value)}")
        print(f"  Durée moy. session : {float(v[4].value):.0f}s")
        print(f"  Taux de rebond     : {float(v[5].value)*100:.0f}%")

    pages = client.run_report(RunReportRequest(
        property=f"properties/{pid}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=dr,
        order_bys=[{"metric": {"metric_name": "screenPageViews"}, "desc": True}],
        limit=8,
    ))
    print("\n  🔝 Pages les plus vues :")
    for row in pages.rows:
        print(f"     {int(row.metric_values[0].value):>6}  {row.dimension_values[0].value}")

    srcs = client.run_report(RunReportRequest(
        property=f"properties/{pid}",
        dimensions=[Dimension(name="sessionDefaultChannelGroup")],
        metrics=[Metric(name="sessions")],
        date_ranges=dr,
        order_bys=[{"metric": {"metric_name": "sessions"}, "desc": True}],
        limit=8,
    ))
    print("\n  🚪 D'où viennent les visiteurs :")
    for row in srcs.rows:
        print(f"     {int(row.metric_values[0].value):>6}  {row.dimension_values[0].value}")
    print()


def cmd_html(args):
    """Génère un dashboard HTML autonome (tableau + graphe + sources + pages)."""
    import json
    from datetime import date
    from google.analytics.data_v1beta.types import (
        DateRange, Dimension, Metric, RunReportRequest,
    )

    pid = get_property_id()
    client = _client()
    today = date.today()
    idx = today.year * 12 + (today.month - 1) - (args.months - 1)
    start = f"{idx // 12:04d}-{idx % 12 + 1:02d}-01"
    full = [DateRange(start_date=start, end_date="today")]

    def run(dims, mets, order=None, desc=True, limit=None):
        req = RunReportRequest(
            property=f"properties/{pid}",
            dimensions=[Dimension(name=d) for d in dims],
            metrics=[Metric(name=m) for m in mets],
            date_ranges=full,
            order_bys=([{"metric": {"metric_name": order}, "desc": desc}] if order
                       else [{"dimension": {"dimension_name": d}} for d in dims]),
            limit=limit,
        )
        return client.run_report(req)

    # 1. Mensuel
    monthly = []
    r = run(["yearMonth"], ["activeUsers", "newUsers", "sessions", "screenPageViews"], order=None)
    for row in r.rows:
        ym = row.dimension_values[0].value
        monthly.append({
            "mois": f"{ym[:4]}-{ym[4:]}",
            "visiteurs": int(row.metric_values[0].value),
            "nouveaux": int(row.metric_values[1].value),
            "sessions": int(row.metric_values[2].value),
            "vues": int(row.metric_values[3].value),
        })

    # 2. Totaux période
    t = run([], ["activeUsers", "newUsers", "sessions", "screenPageViews",
                 "averageSessionDuration", "engagementRate"]).rows
    totals = {}
    if t:
        v = t[0].metric_values
        totals = {
            "visiteurs": int(v[0].value), "nouveaux": int(v[1].value),
            "sessions": int(v[2].value), "vues": int(v[3].value),
            "duree": float(v[4].value), "engagement": float(v[5].value) * 100,
        }

    def topn(dim, met, n=8):
        return [{"label": row.dimension_values[0].value or "(non défini)",
                 "val": int(row.metric_values[0].value)}
                for row in run([dim], [met], order=met, limit=n).rows]

    data = {
        "property": pid, "measurement": MEASUREMENT_ID,
        "genere_le": today.isoformat(), "depuis": start,
        "monthly": monthly, "totals": totals,
        "pages": topn("pagePath", "screenPageViews"),
        "sources": topn("sessionDefaultChannelGroup", "sessions"),
        "devices": topn("deviceCategory", "sessions", 4),
        "villes": topn("city", "activeUsers", 8),
    }

    out = HERE / "stats.html"
    out.write_text(_html_template(data), encoding="utf-8")
    print(f"✓ Dashboard généré : {out}")


def _html_template(d):
    import json
    return HTML_TEMPLATE.replace("/*__DATA__*/", json.dumps(d, ensure_ascii=False))


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Statistiques — Les 100</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root{
    --bg:#f7f1e8; --card:#fffdf9; --ink:#3c2b1a; --muted:#9b8a76;
    --gold:#c8862d; --gold-soft:#e7c88a; --line:#ece2d3; --green:#5a8a4c; --red:#c25b4a;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       line-height:1.5;padding:32px 20px 60px}
  .wrap{max-width:960px;margin:0 auto}
  header{margin-bottom:28px}
  h1{font-size:28px;margin:0 0 4px;letter-spacing:-.02em}
  .sub{color:var(--muted);font-size:14px}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);
     margin:36px 0 14px;font-weight:600}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
  .kpi .n{font-size:30px;font-weight:700;letter-spacing:-.02em}
  .kpi .l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:2px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  @media(max-width:680px){.grid2{grid-template-columns:1fr}}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:right;padding:9px 10px;border-bottom:1px solid var(--line)}
  th:first-child,td:first-child{text-align:left}
  thead th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}
  tbody tr:last-child td{border-bottom:none}
  .up{color:var(--green);font-weight:600}.down{color:var(--red);font-weight:600}
  .partial{color:var(--gold);font-size:11px;font-weight:600;background:#fbf2dd;
            padding:1px 7px;border-radius:20px;margin-left:6px;vertical-align:middle}
  .bar-row{display:flex;align-items:center;gap:10px;margin:9px 0;font-size:14px}
  .bar-row .lab{flex:0 0 42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bar-track{flex:1;background:#f1e8d8;border-radius:6px;height:18px;overflow:hidden}
  .bar-fill{height:100%;background:linear-gradient(90deg,var(--gold-soft),var(--gold));border-radius:6px}
  .bar-row .v{flex:0 0 48px;text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}
  .note{background:#fbf2dd;border:1px solid var(--gold-soft);border-radius:12px;
        padding:14px 16px;font-size:13px;color:#7a5a26;margin-top:30px}
  .chart-box{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 14px}
  footer{margin-top:34px;color:var(--muted);font-size:12px;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>📊 Statistiques — Les 100</h1>
    <div class="sub" id="sub"></div>
  </header>

  <div class="kpis" id="kpis"></div>

  <h2>Visiteurs par mois</h2>
  <div class="chart-box"><canvas id="chart" height="120"></canvas></div>

  <h2>Détail mensuel</h2>
  <div class="card"><table id="mtable">
    <thead><tr><th>Mois</th><th>Visiteurs</th><th>Nouveaux</th><th>Sessions</th><th>Pages vues</th><th>Évol.</th></tr></thead>
    <tbody></tbody>
  </table></div>

  <div class="grid2">
    <div><h2>D'où viennent les visiteurs</h2><div class="card" id="sources"></div></div>
    <div><h2>Pages les plus vues</h2><div class="card" id="pages"></div></div>
  </div>
  <div class="grid2">
    <div><h2>Appareils</h2><div class="card" id="devices"></div></div>
    <div><h2>Villes</h2><div class="card" id="villes"></div></div>
  </div>

  <div class="note" id="note"></div>
  <footer>Données Google Analytics 4 · propriété <span id="pid"></span> · généré le <span id="gen"></span></footer>
</div>

<script>
const DATA = /*__DATA__*/;
const fmt = n => n.toLocaleString('fr-FR');
const PAGE_LABELS = {'/':'Accueil','/index.html':'Accueil','/Goukie.html':'Catalogue Goukies',
  '/Goukie-detail.html':'Fiche produit','/allergenes.html':'Allergènes','/epicerie.html':'Épicerie',
  '/histoire.html':'Notre histoire','/contact.html':'Contact','/merci.html':'Merci (commande)'};
const SRC_LABELS = {'Organic Search':'Recherche Google','Direct':'Direct / bouche-à-oreille',
  'Referral':'Liens externes','Organic Social':'Réseaux sociaux','Unassigned':'Non identifié',
  'Organic Video':'Vidéo','Email':'E-mail'};
const DEV_LABELS = {'mobile':'📱 Mobile','desktop':'💻 Ordinateur','tablet':'📲 Tablette'};

document.getElementById('sub').textContent =
  `Période : depuis ${DATA.depuis} · site ${DATA.measurement}`;
document.getElementById('pid').textContent = DATA.property;
document.getElementById('gen').textContent = DATA.genere_le;

// KPIs
const t = DATA.totals;
const kpis = [
  ['Visiteurs', fmt(t.visiteurs)], ['Sessions', fmt(t.sessions)],
  ['Pages vues', fmt(t.vues)], ['Nouveaux', fmt(t.nouveaux)],
  ['Durée moy.', Math.round(t.duree)+'s'], ['Engagement', Math.round(t.engagement)+'%'],
];
document.getElementById('kpis').innerHTML = kpis.map(([l,n])=>
  `<div class="kpi"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');

// Tableau mensuel (dernier mois = partiel)
const tb = document.querySelector('#mtable tbody');
DATA.monthly.forEach((m,i)=>{
  const prev = i>0 ? DATA.monthly[i-1].visiteurs : null;
  let ev='—';
  if(prev){const p=Math.round((m.visiteurs-prev)/prev*100);
    ev=`<span class="${p>=0?'up':'down'}">${p>=0?'+':''}${p}%</span>`;}
  const last = i===DATA.monthly.length-1;
  tb.innerHTML += `<tr><td>${m.mois}${last?'<span class="partial">en cours</span>':''}</td>`+
    `<td>${fmt(m.visiteurs)}</td><td>${fmt(m.nouveaux)}</td>`+
    `<td>${fmt(m.sessions)}</td><td>${fmt(m.vues)}</td><td>${ev}</td></tr>`;
});

// Graphe
new Chart(document.getElementById('chart'),{
  data:{labels:DATA.monthly.map(m=>m.mois),
    datasets:[
      {type:'bar',label:'Visiteurs',data:DATA.monthly.map(m=>m.visiteurs),
       backgroundColor:'#c8862d',borderRadius:6,order:2},
      {type:'line',label:'Sessions',data:DATA.monthly.map(m=>m.sessions),
       borderColor:'#8a5a2b',backgroundColor:'#8a5a2b',tension:.3,order:1,pointRadius:3}]},
  options:{responsive:true,plugins:{legend:{position:'bottom'}},
    scales:{y:{beginAtZero:true,grid:{color:'#ece2d3'}},x:{grid:{display:false}}}}
});

// Barres horizontales
function bars(elId, items, labelMap){
  const max = Math.max(...items.map(i=>i.val),1);
  document.getElementById(elId).innerHTML = items.map(i=>{
    const lab = labelMap && labelMap[i.label] ? labelMap[i.label] : i.label;
    return `<div class="bar-row"><span class="lab" title="${i.label}">${lab}</span>`+
      `<span class="bar-track"><span class="bar-fill" style="width:${i.val/max*100}%"></span></span>`+
      `<span class="v">${fmt(i.val)}</span></div>`;
  }).join('');
}
bars('sources', DATA.sources, SRC_LABELS);
bars('pages', DATA.pages, PAGE_LABELS);
bars('devices', DATA.devices, DEV_LABELS);
bars('villes', DATA.villes, null);

document.getElementById('note').innerHTML =
  '⚠️ <b>À savoir :</b> les données démarrent en novembre 2025 (GA4 n\'était pas installé avant). '+
  'Le mois en cours est partiel. Les <b>pages vues</b> et l\'<b>engagement</b> d\'avant juin 2026 '+
  'sont surévalués (bug de comptage corrigé le 03/06/2026) — le <b>nombre de visiteurs reste fiable</b>.';
</script>
</body>
</html>
"""


def main():
    p = argparse.ArgumentParser(description="Reporting GA4 — site Les 100")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("properties", help="Liste les propriétés GA4 accessibles")

    m = sub.add_parser("monthly", help="Audience par mois + tendance")
    m.add_argument("--months", type=int, default=12)

    s = sub.add_parser("summary", help="Résumé d'une période")
    s.add_argument("--days", type=int, default=30)

    h = sub.add_parser("html", help="Génère le dashboard HTML")
    h.add_argument("--months", type=int, default=14)

    args = p.parse_args()
    {"properties": cmd_properties, "monthly": cmd_monthly,
     "summary": cmd_summary, "html": cmd_html}[args.cmd](args)


if __name__ == "__main__":
    main()
