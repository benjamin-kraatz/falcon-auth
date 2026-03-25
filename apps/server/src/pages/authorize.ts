import { sharedStyles } from "./styles";

interface AuthorizePageOptions {
  redirectTo: string;
  clientName?: string;
  error?: string;
}

export function renderAuthorizePage({ redirectTo, clientName, error }: AuthorizePageOptions): string {
  const encodedRedirect = encodeURIComponent(redirectTo);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to FALCON Auth</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">F</div>
      <span class="logo-text">FALCON Auth</span>
    </div>
    
    <h1>Sign In</h1>
    <p class="subtitle">${clientName ? `to continue to <strong>${clientName}</strong>` : "to continue"}</p>
    
    ${error ? `<div class="error">${error}</div>` : ""}
    
    <form method="POST" action="/oauth/authorize/submit">
      <input type="hidden" name="redirect_to" value="${encodedRedirect}">
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autocomplete="email" autofocus placeholder="you@example.com">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••">
      </div>
      
      <button type="submit" class="btn btn-primary">Sign In</button>
    </form>
    
    <hr class="divider">
    
    <p class="text-center" style="font-size:0.85rem; color: var(--text-muted)">
      Don't have an account?
      <a href="/oauth/register?redirect_to=${encodedRedirect}" class="link">Create one</a>
    </p>
    
    <p class="text-center mt-2" style="font-size:0.75rem; color: var(--text-muted)">
      By signing in, you agree to FALCON Auth's 
      <a href="#" class="link">Terms of Service</a> and 
      <a href="#" class="link">Privacy Policy</a>.
    </p>
  </div>
</body>
</html>`;
}
