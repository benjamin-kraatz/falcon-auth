import { env } from "@falcon/auth-env/server";

const css = `
body { font-family: system-ui, sans-serif; max-width: 28rem; margin: 2rem auto; padding: 1rem; color: #0f172a; background: #f8fafc; }
h1 { font-size: 1.5rem; margin-bottom: 1rem; }
label { display: block; margin-block: 0.4rem 0.2rem; font-weight: 500; }
input { width: 100%; box-sizing: border-box; padding: 0.5rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; }
button { margin-top: 1rem; width: 100%; padding: 0.55rem; border: none; border-radius: 0.375rem; background: #0f172a; color: #fff; font-weight: 600; cursor: pointer; }
button.secondary { background: #e2e8f0; color: #0f172a; margin-top: 0.5rem; }
a { color: #2563eb; }
.error { color: #b91c1c; margin-top: 0.5rem; font-size: 0.875rem; }
p.muted { color: #64748b; font-size: 0.875rem; }
ul.scopes { margin: 0.5rem 0.75rem; }
`;

function authApiBase(): string {
  const root = env.BETTER_AUTH_URL.replace(/\/$/, "");
  return `${root}/api/auth`;
}

function oauthQueryFromUrl(): string {
  return `typeof window !== 'undefined' ? window.location.search : ''`;
}

export function hostedSignInHtml(): string {
  const oauthQueryJs = oauthQueryFromUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in — FALCON Auth</title>
  <style>${css}</style>
</head>
<body>
  <h1>Sign in</h1>
  <p class="muted">Sign in to continue to the application.</p>
  <form id="f">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required />
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required />
    <div id="err" class="error"></div>
    <button type="submit">Continue</button>
  </form>
  <p><a href="/hosted/sign-up">Create an account</a></p>
  <script>
    const api = ${JSON.stringify(authApiBase())};
    const q = ${oauthQueryJs};
    document.getElementById('f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('err');
      err.textContent = '';
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const body = { email, password, callbackURL: '/' };
      if (q && q.length > 1) {
        body.oauth_query = q.startsWith('?') ? q.slice(1) : q;
      }
      const res = await fetch(api + '/sign-in/email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        err.textContent = data.message || data.error || 'Sign in failed';
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      window.location.href = '/';
    });
  </script>
</body>
</html>`;
}

export function hostedSignUpHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign up — FALCON Auth</title>
  <style>${css}</style>
</head>
<body>
  <h1>Create account</h1>
  <p class="muted">Register to use FALCON Auth.</p>
  <form id="f">
    <label for="name">Name</label>
    <input id="name" name="name" type="text" autocomplete="name" required />
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required />
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="new-password" required />
    <div id="err" class="error"></div>
    <button type="submit">Create account</button>
  </form>
  <p><a href="/hosted/sign-in">Already have an account?</a></p>
  <script>
    const api = ${JSON.stringify(authApiBase())};
    const q = ${oauthQueryFromUrl()};
    document.getElementById('f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('err');
      err.textContent = '';
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const body = { name, email, password, callbackURL: '/' };
      if (q && q.length > 1) {
        body.oauth_query = q.startsWith('?') ? q.slice(1) : q;
      }
      const res = await fetch(api + '/sign-up/email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        err.textContent = data.message || data.error || 'Sign up failed';
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      window.location.href = '/';
    });
  </script>
</body>
</html>`;
}

export function hostedConsentHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Authorize — FALCON Auth</title>
  <style>${css}</style>
</head>
<body>
  <h1>Authorize application</h1>
  <p class="muted">Review the requested permissions before continuing.</p>
  <form id="f">
    <div id="scopes"></div>
    <div id="err" class="error"></div>
    <button type="submit" name="accept" value="1">Allow</button>
    <button type="button" class="secondary" id="deny">Deny</button>
  </form>
  <script>
    const api = ${JSON.stringify(authApiBase())};
    const q = ${oauthQueryFromUrl()};
    function qs() {
      if (!q || q.length <= 1) return '';
      return q.startsWith('?') ? q.slice(1) : q;
    }
    async function postConsent(accept) {
      const err = document.getElementById('err');
      err.textContent = '';
      const body = { accept, oauth_query: qs() };
      const res = await fetch(api + '/oauth2/consent', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        err.textContent = data.message || data.error_description || data.error || 'Consent failed';
        return;
      }
      if (data.redirect_uri) {
        window.location.href = data.redirect_uri;
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    }
    document.getElementById('f').addEventListener('submit', (e) => {
      e.preventDefault();
      postConsent(true);
    });
    document.getElementById('deny').addEventListener('click', () => postConsent(false));
    const params = new URLSearchParams(q.startsWith('?') ? q.slice(1) : q);
    const scope = params.get('scope') || '';
    const scopes = scope.split(/\\s+/).filter(Boolean);
    const el = document.getElementById('scopes');
    if (scopes.length) {
      el.innerHTML = '<p>Requested scopes:</p><ul class="scopes">' +
        scopes.map(s => '<li>' + s + '</li>').join('') + '</ul>';
    }
  </script>
</body>
</html>`;
}
