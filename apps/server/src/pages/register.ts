import { sharedStyles } from "./styles";

interface RegisterPageOptions {
  redirectTo: string;
  error?: string;
}

export function renderRegisterPage({ redirectTo, error }: RegisterPageOptions): string {
  const encodedRedirect = encodeURIComponent(redirectTo);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Account — FALCON Auth</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">F</div>
      <span class="logo-text">FALCON Auth</span>
    </div>
    
    <h1>Create Account</h1>
    <p class="subtitle">Get started with FALCON Auth</p>
    
    ${error ? `<div class="error">${error}</div>` : ""}
    
    <form method="POST" action="/oauth/register/submit">
      <input type="hidden" name="redirect_to" value="${encodedRedirect}">
      
      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="name" required autocomplete="name" autofocus placeholder="Jane Smith">
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="new-password" placeholder="At least 8 characters">
      </div>
      
      <button type="submit" class="btn btn-primary">Create Account</button>
    </form>
    
    <hr class="divider">
    
    <p class="text-center" style="font-size:0.85rem;color:var(--text-muted)">
      Already have an account?
      <a href="/oauth/authorize?redirect_to=${encodedRedirect}" class="link">Sign in</a>
    </p>
  </div>
</body>
</html>`;
}
