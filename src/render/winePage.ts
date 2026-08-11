import type { Nutrition, Wine } from '../types.js'
import { wineSlug } from '../utils/slug.js'

// Canonical URLs keep the .html extension and the bare host: the Papaki package
// serves static files straight from nginx, so there is no rewrite available to
// make an extensionless path resolve, and www is only an alias of this host.
const ORIGIN = 'https://ktimakoutsogiorga.gr'

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmt(n: number): string {
  return n.toFixed(2)
}

function nutritionRows(n: Nutrition): string {
  const rows: Array<{ label: string; value: string; indent?: boolean }> = [
    { label: 'Ενέργεια', value: `${n.energy.kj} kJ / ${n.energy.kcal} kcal` },
    { label: 'Λιπαρά', value: `${fmt(n.fat)} g` },
    { label: 'εκ των οποίων κορεσμένα', value: `${fmt(n.saturatedFat)} g`, indent: true },
    { label: 'Υδατάνθρακες', value: `${fmt(n.carbohydrates)} g` },
    { label: 'εκ των οποίων σάκχαρα', value: `${fmt(n.sugars)} g`, indent: true },
    { label: 'Πρωτεΐνες', value: `${fmt(n.protein)} g` },
    { label: 'Αλάτι', value: `${fmt(n.salt)} g` },
  ]
  return rows
    .map(
      (r) =>
        `<tr><td class="${r.indent ? 'table-label-indent' : 'table-label'}">${escapeHtml(r.label)}</td><td class="table-value">${escapeHtml(r.value)}</td></tr>`,
    )
    .join('')
}

const STYLES = `
  /* Brand palette, kept in sync with the :root block in index.html. The last four are
     derived UI states, not part of the source palette. */
  :root{
    color-scheme:dark;
    --ink-black:#1D1D1B;
    --emboss-black:#010101;
    --gold-foil:#DFC480;
    --wine-red:#CD1719;
    --white-ink:#CAC5E4;
    --muted-grey:#BCBCBA;
    --paper:#FFFFFF;
    --gold-hover:#EBD49C;
    --gold-dim:#A38F5B;
    --red-text:#E8524F;
    --surface:#262624;
  }
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html,body{min-height:100%;background:var(--ink-black);color:var(--white-ink);font-family:'Piazzolla',Georgia,serif;font-weight:300;line-height:1.6}
  .page{min-height:100vh;padding:24px 16px}
  .container{max-width:560px;margin:0 auto}
  .heading{font-family:'Piazzolla',Georgia,serif;font-style:italic;font-weight:400;color:var(--paper);font-size:1.8rem;margin-bottom:6px}
  .subtitle{color:var(--muted-grey);font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:24px}
  .section-heading{color:var(--white-ink);text-transform:uppercase;letter-spacing:.12em;font-size:14px;font-weight:600;border-bottom:2px solid var(--gold-foil);padding-bottom:6px;margin-bottom:8px}
  .table-caption{display:block;color:var(--muted-grey);font-size:12px;margin-bottom:8px}
  .table{width:100%;border-collapse:collapse;margin-bottom:24px}
  .table td{padding:8px 12px 8px 0;border-bottom:1px solid rgba(223,196,128,.18);color:var(--white-ink);font-size:14px}
  .table tr:last-child td{border-bottom:0}
  .table-label{font-weight:500}
  .table-label-indent{font-weight:400;padding-left:24px!important}
  .table-value{text-align:right;font-weight:500}
  .ingredients{color:var(--white-ink);line-height:1.7;margin-bottom:24px;font-size:14px}
  .notice{display:flex;align-items:flex-start;gap:12px;background:rgba(205,23,25,.06);border:1px solid rgba(223,196,128,.18);border-radius:8px;padding:14px 18px;margin-bottom:20px}
  .notice-icon{flex-shrink:0;color:var(--gold-foil);display:flex;align-items:center;justify-content:center;line-height:1}
  .notice-text{color:var(--white-ink);font-weight:500;font-size:14px;line-height:1.5}
  .link-btn{display:block;width:fit-content;margin:24px auto 0;padding:8px 16px;color:var(--gold-foil);font-weight:500;text-decoration:none;border-radius:4px;font-size:14px;transition:background-color .2s}
  .link-btn:hover{background:rgba(205,23,25,.06)}
  @media (min-width:900px){.page{padding:32px 24px}.heading{font-size:2.2rem}.subtitle{margin-bottom:32px}}
  /* Variable fonts, wght 100-900. The font-weight range is required: the default instance
     is Thin, so omitting it renders every element hairline. Greek unicode-range is derived
     from the files' actual cmap — a wider range than the file covers falls back silently. */
  @font-face{font-family:'Piazzolla';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/piazzolla-greek.woff2) format('woff2');unicode-range:U+0374-0375,U+037A,U+037E,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03CF,U+03D7}
  @font-face{font-family:'Piazzolla';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/piazzolla-greek-italic.woff2) format('woff2');unicode-range:U+0374-0375,U+037A,U+037E,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03CF,U+03D7}
  @font-face{font-family:'Piazzolla';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/piazzolla-latin.woff2) format('woff2')}
  @font-face{font-family:'Piazzolla';font-style:italic;font-weight:100 900;font-display:swap;src:url(/fonts/piazzolla-latin-italic.woff2) format('woff2')}
`

const ALERT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`

export function renderWinePage(wine: Wine): string {
  const name = wine.nameEl ?? wine.name
  const ingredients = wine.ingredientsEl ?? wine.ingredients
  const title = `${name} — Ορεινό Κτήμα Κουτσόγιωργα`

  const nutritionSection = wine.nutrition
    ? `<h6 class="section-heading">Διατροφική Δήλωση</h6>
        <span class="table-caption">Ανά 100 ml</span>
        <table class="table"><tbody>${nutritionRows(wine.nutrition)}</tbody></table>`
    : ''

  const ingredientsSection = ingredients
    ? `<h6 class="section-heading">Συστατικά</h6>
        <p class="ingredients">${escapeHtml(ingredients)}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#010101">
<link rel="canonical" href="${ORIGIN}/wines/${wineSlug(wine)}.html">
<title>${escapeHtml(title)}</title>
<link rel="preload" as="font" type="font/woff2" href="/fonts/piazzolla-greek.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/piazzolla-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/piazzolla-greek-italic.woff2" crossorigin>
<style>${STYLES}</style>
</head>
<body>
<main class="page">
<div class="container">
<h1 class="heading">${escapeHtml(name)}</h1>
<p class="subtitle">${escapeHtml(wine.alcohol)} vol. · 750ml · ${escapeHtml(wine.grape)}</p>
${nutritionSection}
${ingredientsSection}
<div class="notice">
<span class="notice-icon">${ALERT_ICON}</span>
<span class="notice-text">Αλλεργιογόνα: περιέχει θειώδη</span>
</div>
<a class="link-btn" href="/">Επισκέψου την ιστοσελίδα μας ktimakoutsogiorga.gr</a>
</div>
</main>
</body>
</html>
`
}
