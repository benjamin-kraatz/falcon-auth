/**
 * Hosted HTML pages served directly by the auth server.
 *
 * All pages are self-contained (inline CSS + JS, no external dependencies) so
 * the server has zero static-file-serving complexity.
 */

// ---------------------------------------------------------------------------
// Shared design tokens
// ---------------------------------------------------------------------------

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d0f14;
    --surface:  #161920;
    --border:   #2a2d38;
    --text:     #e8eaf0;
    --muted:    #8b8fa8;
    --accent:   #6366f1;
    --accent-h: #4f52d9;
    --danger:   #ef4444;
    --radius:   10px;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    line-height: 1.6;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0,0,0,.5);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: .6rem;
    margin-bottom: 2rem;
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -.02em;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  h1 { font-size: 1.35rem; font-weight: 700; margin-bottom: .4rem; }
  .sub { color: var(--muted); font-size: .875rem; margin-bottom: 1.75rem; }

  .field { margin-bottom: 1.1rem; }
  label { display: block; font-size: .825rem; font-weight: 500; color: var(--muted); margin-bottom: .35rem; }

  input {
    width: 100%;
    padding: .65rem .85rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: .9rem;
    font-family: var(--font);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
  }

  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99,102,241,.2);
  }

  input::placeholder { color: var(--muted); opacity: .7; }

  button[type=submit] {
    width: 100%;
    padding: .7rem;
    background: var(--accent);
    color: #fff;
    font-size: .925rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: .4rem;
    transition: background .15s, opacity .15s;
  }

  button[type=submit]:hover { background: var(--accent-h); }
  button[type=submit]:disabled { opacity: .5; cursor: not-allowed; }

  .err {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.3);
    color: #fca5a5;
    border-radius: 6px;
    padding: .6rem .85rem;
    font-size: .85rem;
    margin-bottom: 1rem;
    display: none;
  }

  .footer-link {
    text-align: center;
    margin-top: 1.4rem;
    font-size: .85rem;
    color: var(--muted);
  }

  .footer-link a { color: var(--accent); text-decoration: none; }
  .footer-link a:hover { text-decoration: underline; }
`;

// ---------------------------------------------------------------------------
// Sign-in page
// ---------------------------------------------------------------------------

export function signInHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in · FALCON Auth</title>
  <style>${css}</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">🦅</div>
      FALCON Auth
    </div>
    <h1>Welcome back</h1>
    <p class="sub">Sign in to continue</p>

    <div class="err" id="err"></div>

    <form id="form">
      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
      </div>
      <button type="submit" id="btn">Sign in</button>
    </form>

    <div class="footer-link">
      Don't have an account? <a href="/sign-up">Sign up</a>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const btn  = document.getElementById('btn');
    const err  = document.getElementById('err');

    function showError(msg) {
      err.textContent = msg;
      err.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Signing in…';

      const params = new URLSearchParams(window.location.search);
      const callbackURL = params.get('callbackURL') || '/';

      try {
        const res = await fetch('/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: form.email.value.trim(),
            password: form.password.value,
            callbackURL,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const redirect = data?.url || callbackURL;
          window.location.href = redirect;
        } else {
          const data = await res.json().catch(() => ({}));
          showError(data?.message || 'Invalid email or password. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Sign in';
        }
      } catch {
        showError('Network error. Please check your connection and try again.');
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    });
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Sign-up page
// ---------------------------------------------------------------------------

export function signUpHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Create account · FALCON Auth</title>
  <style>${css}</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">🦅</div>
      FALCON Auth
    </div>
    <h1>Create account</h1>
    <p class="sub">Get started with FALCON Auth</p>

    <div class="err" id="err"></div>

    <form id="form">
      <div class="field">
        <label for="name">Full name</label>
        <input type="text" id="name" name="name" placeholder="Jane Smith" required autocomplete="name" />
      </div>
      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="At least 8 characters" required autocomplete="new-password" minlength="8" />
      </div>
      <button type="submit" id="btn">Create account</button>
    </form>

    <div class="footer-link">
      Already have an account? <a href="/sign-in">Sign in</a>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const btn  = document.getElementById('btn');
    const err  = document.getElementById('err');

    function showError(msg) {
      err.textContent = msg;
      err.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Creating account…';

      const params = new URLSearchParams(window.location.search);
      const callbackURL = params.get('callbackURL') || '/';

      try {
        const res = await fetch('/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            callbackURL,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const redirect = data?.url || callbackURL;
          window.location.href = redirect;
        } else {
          const data = await res.json().catch(() => ({}));
          showError(data?.message || 'Could not create account. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Create account';
        }
      } catch {
        showError('Network error. Please check your connection and try again.');
        btn.disabled = false;
        btn.textContent = 'Create account';
      }
    });
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// OAuth consent page
// ---------------------------------------------------------------------------

export function consentHtml(): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Authorize access · FALCON Auth</title>
  <style>
    ${css}

    .app-icon {
      width: 52px;
      height: 52px;
      background: var(--border);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin: 0 auto 1.2rem;
    }

    .app-name { text-align: center; font-weight: 700; font-size: 1.1rem; margin-bottom: .3rem; }
    .app-sub  { text-align: center; color: var(--muted); font-size: .875rem; margin-bottom: 1.75rem; }

    .scopes {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem 1.1rem;
      margin-bottom: 1.5rem;
    }

    .scopes-title { font-size: .8rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .75rem; }

    .scope-item {
      display: flex;
      align-items: center;
      gap: .6rem;
      padding: .3rem 0;
      font-size: .9rem;
    }

    .scope-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    .actions { display: flex; gap: .75rem; }

    .btn-deny {
      flex: 1;
      padding: .7rem;
      background: transparent;
      color: var(--muted);
      font-size: .925rem;
      font-weight: 600;
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      transition: border-color .15s, color .15s;
    }

    .btn-deny:hover { border-color: var(--danger); color: #fca5a5; }

    .btn-allow {
      flex: 1;
      padding: .7rem;
      background: var(--accent);
      color: #fff;
      font-size: .925rem;
      font-weight: 600;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background .15s, opacity .15s;
    }

    .btn-allow:hover { background: var(--accent-h); }
    .btn-allow:disabled, .btn-deny:disabled { opacity: .5; cursor: not-allowed; }

    .legal {
      text-align: center;
      font-size: .78rem;
      color: var(--muted);
      margin-top: 1.2rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo" style="justify-content:center">
      <div class="logo-icon">🦅</div>
      FALCON Auth
    </div>

    <div class="app-icon" id="appIcon">🔌</div>
    <div class="app-name" id="appName">An application</div>
    <p class="app-sub">is requesting access to your account</p>

    <div class="err" id="err"></div>

    <div class="scopes">
      <div class="scopes-title">Permissions requested</div>
      <div id="scopeList"></div>
    </div>

    <div class="actions">
      <button class="btn-deny"  id="btnDeny"  type="button">Deny</button>
      <button class="btn-allow" id="btnAllow" type="button">Allow access</button>
    </div>

    <p class="legal">
      Only allow access if you trust this application.<br/>
      You can revoke access at any time from your account settings.
    </p>
  </div>

  <script>
    const SCOPE_LABELS = {
      openid:  'Know your identity (OpenID)',
      profile: 'Read your profile information',
      email:   'Read your email address',
      offline_access: 'Stay signed in (refresh tokens)',
    };

    const params     = new URLSearchParams(window.location.search);
    const clientId   = params.get('client_id') || '';
    const scopeParam = params.get('scope') || 'openid profile email';
    const scopes     = scopeParam.split(/[ ,]+/).filter(Boolean);

    // Populate scope list
    const scopeList = document.getElementById('scopeList');
    for (const s of scopes) {
      const item = document.createElement('div');
      item.className = 'scope-item';
      item.innerHTML =
        '<span class="scope-dot"></span>' +
        '<span>' + (SCOPE_LABELS[s] || s) + '</span>';
      scopeList.appendChild(item);
    }

    // Try to show the application name via the OIDC discovery client metadata
    if (clientId) {
      document.getElementById('appName').textContent = clientId;
    }

    const btnAllow = document.getElementById('btnAllow');
    const btnDeny  = document.getElementById('btnDeny');
    const err      = document.getElementById('err');

    function showError(msg) {
      err.textContent = msg;
      err.style.display = 'block';
    }

    async function handleConsent(accept) {
      btnAllow.disabled = true;
      btnDeny.disabled  = true;
      btnAllow.textContent = accept ? 'Authorizing…' : 'Allow access';
      err.style.display = 'none';

      try {
        const res = await fetch('/api/auth/oauth2/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accept, ...Object.fromEntries(params.entries()) }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.redirectURI) {
            window.location.href = data.redirectURI;
          } else if (data?.redirect) {
            window.location.href = data.redirect;
          } else {
            window.location.href = accept ? '/' : (params.get('redirect_uri') || '/');
          }
        } else {
          const data = await res.json().catch(() => ({}));
          showError(data?.message || (accept ? 'Could not grant access. Please try again.' : 'Could not deny access.'));
          btnAllow.disabled = false;
          btnDeny.disabled  = false;
          btnAllow.textContent = 'Allow access';
        }
      } catch {
        showError('Network error. Please check your connection and try again.');
        btnAllow.disabled = false;
        btnDeny.disabled  = false;
        btnAllow.textContent = 'Allow access';
      }
    }

    btnAllow.addEventListener('click', () => handleConsent(true));
    btnDeny.addEventListener('click',  () => handleConsent(false));
  </script>
</body>
</html>`;
}
