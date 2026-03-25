import { sharedStyles } from "./styles";

interface ScopeInfo {
  name: string;
  description: string;
}

const SCOPE_DESCRIPTIONS: Record<string, ScopeInfo> = {
  openid: { name: "OpenID", description: "Verify your identity" },
  email: { name: "Email", description: "Access your email address" },
  profile: { name: "Profile", description: "Access your name and profile picture" },
  "offline_access": { name: "Offline Access", description: "Stay signed in when you're not using the app" },
};

interface ConsentPageOptions {
  clientName: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  nonce?: string;
  userEmail?: string;
  userName?: string;
}

export function renderConsentPage(options: ConsentPageOptions): string {
  const {
    clientName,
    scopes,
    redirectUri,
    state,
    codeChallenge,
    codeChallengeMethod,
    nonce,
    userEmail,
    userName,
  } = options;

  const appInitial = (clientName || "A")[0].toUpperCase();
  const scopeList = scopes
    .map((scope) => {
      const info = SCOPE_DESCRIPTIONS[scope] ?? { name: scope, description: `Access to ${scope}` };
      return `<li class="scope-item">
        <span class="scope-icon">✓</span>
        <div>
          <strong>${info.name}</strong>
          <div style="font-size:0.8rem;color:var(--text-muted)">${info.description}</div>
        </div>
      </li>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize — FALCON Auth</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">F</div>
      <span class="logo-text">FALCON Auth</span>
    </div>
    
    <h1>Authorize Access</h1>
    <p class="subtitle">Review the permissions requested</p>
    
    <div class="app-info">
      <div class="app-avatar">${appInitial}</div>
      <div>
        <div class="app-name">${clientName}</div>
        <div class="app-domain">wants to access your FALCON Auth account</div>
      </div>
    </div>
    
    ${userName ? `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">Signed in as <strong>${userName}</strong> (${userEmail})</p>` : ""}
    
    <p style="font-size:0.85rem;font-weight:500;margin-bottom:0.5rem">This app will be able to:</p>
    <ul class="scope-list">
      ${scopeList}
    </ul>
    
    <form method="POST" action="/oauth/consent/submit">
      <input type="hidden" name="client_id" value="${options.clientId}">
      <input type="hidden" name="redirect_uri" value="${encodeURIComponent(redirectUri)}">
      <input type="hidden" name="scopes" value="${scopes.join(" ")}">
      ${state ? `<input type="hidden" name="state" value="${state}">` : ""}
      ${codeChallenge ? `<input type="hidden" name="code_challenge" value="${codeChallenge}">` : ""}
      ${codeChallengeMethod ? `<input type="hidden" name="code_challenge_method" value="${codeChallengeMethod}">` : ""}
      ${nonce ? `<input type="hidden" name="nonce" value="${nonce}">` : ""}
      
      <div class="consent-actions">
        <button type="submit" name="decision" value="deny" class="btn btn-secondary">Deny</button>
        <button type="submit" name="decision" value="allow" class="btn btn-primary">Allow</button>
      </div>
    </form>
    
    <p class="text-center mt-2" style="font-size:0.75rem;color:var(--text-muted)">
      You can revoke this access at any time from your FALCON Auth settings.
    </p>
  </div>
</body>
</html>`;
}
