function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmt(n) {
  return n.toFixed(2)
}

function nutritionRows(n) {
  const rows = [
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
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html,body{min-height:100%;background:#f5f0e8;color:#2a2825;font-family:'Lato',system-ui,-apple-system,sans-serif;font-weight:300;line-height:1.6}
  .page{min-height:100vh;padding:24px 16px}
  .container{max-width:600px;margin:0 auto}
  .heading{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;color:#6b1e24;font-size:1.8rem;margin-bottom:8px}
  .subtitle{color:#8b8680;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:24px}
  .description{color:#2a2825;font-size:15px;line-height:1.7;margin-bottom:32px}
  .section-heading{color:#2a2825;text-transform:uppercase;letter-spacing:.12em;font-size:14px;font-weight:600;border-bottom:2px solid #c9ae6e;padding-bottom:6px;margin-bottom:8px}
  .table-caption{display:block;color:#8b8680;font-size:12px;margin-bottom:8px}
  .table{width:100%;border-collapse:collapse;margin-bottom:32px}
  .table td{padding:8px 12px 8px 0;border-bottom:1px solid #e8e3da;color:#2a2825;font-size:14px}
  .table-label{font-weight:500}
  .table-label-indent{font-weight:400;padding-left:24px!important}
  .table-value{text-align:right;font-weight:500}
  .ingredients{color:#2a2825;line-height:1.7;margin-bottom:32px;font-size:14px}
  .notice{display:flex;align-items:flex-start;gap:12px;background:rgba(107,30,36,.06);border:1px solid #e8e3da;border-radius:8px;padding:16px 20px;margin-bottom:24px}
  .notice-icon{flex-shrink:0;color:#6b1e24;display:flex;align-items:center;justify-content:center;line-height:1}
  .notice-text{color:#6b1e24;font-weight:500;font-size:14px;line-height:1.5}
  .link-btn{display:block;width:fit-content;margin:32px auto 0;padding:8px 16px;color:#6b1e24;font-weight:500;text-decoration:none;border-radius:4px;font-size:14px;transition:background-color .2s}
  .link-btn:hover{background:rgba(107,30,36,.06)}
  @media (min-width:900px){.page{padding:40px 24px}.heading{font-size:2.2rem}.subtitle{margin-bottom:40px}}
  @font-face{font-family:'Playfair Display';font-style:italic;font-weight:400;font-display:swap;src:local('Playfair Display Italic'),url(/fonts/playfair-400.woff2) format('woff2')}
  @font-face{font-family:'Playfair Display';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/playfair-400.woff2) format('woff2')}
  @font-face{font-family:'Lato';font-style:normal;font-weight:300;font-display:swap;src:url(/fonts/lato-300.woff2) format('woff2');unicode-range:U+0370-03FF,U+1F00-1FFF}
  @font-face{font-family:'Lato';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/lato-400.woff2) format('woff2');unicode-range:U+0370-03FF,U+1F00-1FFF}
`

const ALERT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`

export function renderWinePage(wine) {
  const name = wine.nameEl ?? wine.name
  const description = wine.descriptionEl ?? wine.description
  const ingredients = wine.ingredientsEl ?? wine.ingredients
  const title = `${name} — Ορεινό Κτήμα Couchell`

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
<title>${escapeHtml(title)}</title>
<link rel="preload" as="font" type="font/woff2" href="/fonts/lato-300.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/playfair-400.woff2" crossorigin>
<style>${STYLES}</style>
</head>
<body>
<main class="page">
<div class="container">
<h1 class="heading">${escapeHtml(name)}</h1>
<p class="subtitle">${escapeHtml(wine.alcohol)} vol. · 750ml · ${escapeHtml(wine.grape)}</p>
<p class="description">${escapeHtml(description)}</p>
${nutritionSection}
${ingredientsSection}
<div class="notice">
<span class="notice-icon">${ALERT_ICON}</span>
<span class="notice-text">Αλλεργιογόνα: περιέχει θειώδη</span>
</div>
<a class="link-btn" href="/">Επισκέψου την ιστοσελίδα μας couchell-winery.gr</a>
</div>
</main>
</body>
</html>
`
}
