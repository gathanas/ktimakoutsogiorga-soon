const COOKIE = 'ktima_subscribed=1'
// index.html always ships both nodes, so these assert rather than guard: a guard would
// turn a missing node into a silent no-op, where today it throws.
const slot = document.getElementById('signup-slot')!

function showConfirmation() {
  slot.innerHTML = '<p class="confirmation">Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σας</p>'
}

if (document.cookie.split('; ').some(c => c === COOKIE)) {
  showConfirmation()
} else {
  document.getElementById('signup-form')!.addEventListener('submit', e => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(r => {
        if (r.ok) {
          document.cookie = COOKIE + '; max-age=31536000; path=/; SameSite=Lax'
          showConfirmation()
        } else {
          alert('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.')
        }
      })
      .catch(() => alert('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.'))
  })
}
