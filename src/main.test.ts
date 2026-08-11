// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ACTION = 'https://formsubmit.co/couchellwinery@gmail.com'

// Mirrors the signup markup in index.html, which is the DOM contract main.ts asserts on.
const FIXTURE = `
  <div id="signup-slot">
    <form class="signup" id="signup-form" action="${ACTION}" method="POST">
      <input type="email" name="email" value="taster@example.com">
      <button type="submit">Ειδοποιήστε με</button>
    </form>
  </div>
`

// main.ts runs its logic at import time, so every test builds the DOM first and then
// imports a fresh copy of the module.
async function loadMain() {
  await import('./main.js')
}

function submitForm() {
  const form = document.getElementById('signup-form')
  if (!form) throw new Error('fixture is missing #signup-form')
  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
}

const confirmation = () => document.querySelector('.confirmation')

beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  document.body.innerHTML = FIXTURE
  document.cookie = 'ktima_subscribed=; max-age=0; path=/'
  vi.stubGlobal('alert', vi.fn())
})

describe('signup form', () => {
  it('shows the confirmation straight away when the cookie is already set, without fetching', async () => {
    document.cookie = 'ktima_subscribed=1; path=/'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await loadMain()

    expect(confirmation()?.textContent).toContain('Ευχαριστούμε')
    expect(document.getElementById('signup-form')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the form to its action instead of navigating', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await loadMain()

    submitForm()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const call = fetchMock.mock.calls[0]
    if (!call) throw new Error('fetch was not called')
    const [url, init] = call
    expect(url).toBe(ACTION)
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ Accept: 'application/json' })
    expect(init.body).toBeInstanceOf(FormData)
    expect(init.body.get('email')).toBe('taster@example.com')
  })

  it('prevents the default form submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await loadMain()

    const form = document.getElementById('signup-form')!
    const event = new Event('submit', { cancelable: true, bubbles: true })
    form.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('writes the cookie and shows the confirmation on a successful post', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await loadMain()

    submitForm()

    await vi.waitFor(() => expect(confirmation()).not.toBeNull())
    expect(confirmation()?.textContent).toContain('Ευχαριστούμε')
    expect(document.cookie).toContain('ktima_subscribed=1')
  })

  it('alerts and keeps the form when the server rejects the post', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await loadMain()

    submitForm()

    await vi.waitFor(() => expect(alert).toHaveBeenCalled())
    expect(alert).toHaveBeenCalledWith('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.')
    expect(confirmation()).toBeNull()
    expect(document.cookie).not.toContain('ktima_subscribed=1')
    expect(document.getElementById('signup-form')).not.toBeNull()
  })

  it('alerts when the request fails outright', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await loadMain()

    submitForm()

    await vi.waitFor(() => expect(alert).toHaveBeenCalled())
    expect(alert).toHaveBeenCalledWith('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.')
    expect(confirmation()).toBeNull()
    expect(document.cookie).not.toContain('ktima_subscribed=1')
  })
})
