export const sharedStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #0a0a0a;
    --surface: #141414;
    --surface-2: #1e1e1e;
    --border: #2a2a2a;
    --text: #f0f0f0;
    --text-muted: #888;
    --primary: #6366f1;
    --primary-hover: #4f52d3;
    --danger: #ef4444;
    --success: #22c55e;
    --radius: 8px;
    --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }
  
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    justify-content: center;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: var(--primary);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
  }
  
  .logo-text {
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.02em;
  }
  
  h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.25rem; text-align: center; }
  .subtitle { color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-bottom: 1.5rem; }
  
  .form-group { margin-bottom: 1rem; }
  label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.4rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  
  input[type="email"],
  input[type="password"],
  input[type="text"] {
    width: 100%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 0.75rem;
    color: var(--text);
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s;
  }
  
  input:focus { border-color: var(--primary); }
  
  .btn {
    display: block;
    width: 100%;
    padding: 0.7rem 1rem;
    border-radius: var(--radius);
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: background 0.15s, transform 0.1s;
  }
  
  .btn:active { transform: translateY(1px); }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-hover); }
  .btn-secondary { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .btn-danger { background: var(--danger); color: white; }
  
  .divider { border: none; border-top: 1px solid var(--border); margin: 1.25rem 0; }
  
  .link { color: var(--primary); text-decoration: none; font-size: 0.85rem; }
  .link:hover { text-decoration: underline; }
  
  .text-center { text-align: center; }
  .mt-1 { margin-top: 0.5rem; }
  .mt-2 { margin-top: 1rem; }
  .mt-3 { margin-top: 1.5rem; }
  
  .error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius);
    padding: 0.65rem 0.75rem;
    color: #fca5a5;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .scope-list { list-style: none; margin: 0.75rem 0; }
  .scope-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border);
  }
  .scope-item:last-child { border-bottom: none; }
  .scope-icon { color: var(--success); font-size: 0.8rem; }
  
  .app-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--surface-2);
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
  }
  
  .app-avatar {
    width: 40px;
    height: 40px;
    background: var(--primary);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
  }
  
  .app-name { font-weight: 600; font-size: 0.95rem; }
  .app-domain { font-size: 0.8rem; color: var(--text-muted); }
  
  .consent-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
  .consent-actions .btn { flex: 1; }
`;
