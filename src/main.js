const COOKIE = 'couchell_subscribed=1'
const slot = document.getElementById('signup-slot')

function showConfirmation() {
  slot.innerHTML = '<p class="confirmation">Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σας</p>'
}

if (document.cookie.split('; ').some(c => c === COOKIE)) {
  showConfirmation()
} else {
  document.getElementById('signup-form').addEventListener('submit', e => {
    e.preventDefault()
    const form = e.currentTarget
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
