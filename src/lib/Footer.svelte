<script lang="ts">
  import { ExternalLink, Heart, Send, Check } from 'lucide-svelte';

  let email = $state('');
  let sent = $state(false);

  function subscribe(e: Event) {
    e.preventDefault();
    if (!email.trim()) return;
    sent = true;
  }
</script>

<footer class="footer">
  <div class="footer-container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="brand-wrapper">
          <span class="brand-mark" aria-hidden="true"><img src="/logo.svg" alt="" width="28" height="28" /></span>
          <span class="brand-text">
            <span class="brand-name">GAME<em>WISH</em></span>
            <span class="brand-sub">sua coleção viva</span>
          </span>
        </div>
        <p class="brand-desc">Sua wishlist de games com dados da RAWG. Explore, filtre e guarde favoritos no navegador.</p>
        <p class="status-line">
          <span class="status-dot" aria-hidden="true"></span>
          RAWG API · operacional
        </p>
      </div>

      <nav class="footer-links" aria-label="Navegação do rodapé">
        <h4>Navegação</h4>
        <ul>
          <li><a href="/">Explorar</a></li>
          <li><a href="/?tab=wishlist">Wishlist</a></li>
          <li><a href="#catalogo">Catálogo</a></li>
        </ul>
      </nav>

      <nav class="footer-links" aria-label="Recursos externos">
        <h4>Recursos</h4>
        <ul>
          <li><a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">RAWG API <ExternalLink size={12} aria-hidden="true" /></a></li>
          <li><a href="https://svelte.dev" target="_blank" rel="noreferrer">SvelteKit <ExternalLink size={12} aria-hidden="true" /></a></li>
          <li><a href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide Icons <ExternalLink size={12} aria-hidden="true" /></a></li>
        </ul>
      </nav>

      <div class="footer-news">
        <h4>Drops da semana</h4>
        <p>Um resumo (fake) com lançamentos e achados. Sem spam.</p>
        {#if sent}
          <p class="news-ok" role="status"><Check size={15} aria-hidden="true" /> Fechado! Você está na lista.</p>
        {:else}
          <form class="news-form" onsubmit={subscribe}>
            <label class="sr-only" for="news-email">Seu e-mail</label>
            <input id="news-email" type="email" required placeholder="voce@email.com" bind:value={email} autocomplete="email" />
            <button type="submit" aria-label="Assinar newsletter"><Send size={15} aria-hidden="true" /></button>
          </form>
        {/if}
      </div>
    </div>

    <div class="footer-bottom">
      <p>© {new Date().getFullYear()} Gamewish. Feito com <Heart size={14} aria-hidden="true" /> em SvelteKit.</p>
      <p class="rawg-credit">
        Dados: <a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG <ExternalLink size={12} aria-hidden="true" /></a>
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #04060b;
    border-top: 1px solid var(--border);
    padding: 52px 0 24px;
    margin-top: auto;
    position: relative;
  }
  .footer::before {
    content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px;
    background: var(--lime); opacity: 0.9;
  }

  .footer-container {
    width: min(1440px, calc(100% - 32px));
    margin: 0 auto;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 48px;
  }

  .brand-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .brand-mark {
    width: 40px; height: 40px; border-radius: 12px;
    display: grid; place-items: center; color: #0d1203;
    background: var(--lime); transform: rotate(-4deg); flex-shrink: 0;
    overflow: hidden; padding: 2px;
  }
  .brand-mark img { width: 100%; height: 100%; border-radius: 10px; display: block; }
  .brand-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .brand-name {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--text-strong);
  }
  .brand-name em { font-style: normal; color: var(--lime); }
  .brand-sub {
    font-size: 0.64rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-muted);
  }

  .brand-desc {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0 0 14px;
    max-width: 34ch;
  }
  .status-line {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--lime);
    border: 1px solid var(--border-accent); border-radius: var(--radius-pill);
    padding: 7px 13px; background: rgba(215,245,66,0.06); margin: 0;
  }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--lime); animation: pulse-dot 2s ease-in-out infinite; }

  .footer-links h4, .footer-news h4 {
    color: var(--text-strong);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    margin: 0 0 16px;
  }

  .footer-links ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .footer-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color var(--duration-fast) var(--ease-in-out);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .footer-links a:hover {
    color: var(--lime);
  }
  .footer-news p { color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; margin: 0 0 12px; }
  .news-form {
    display: flex; gap: 8px; align-items: center;
    border: 1px solid var(--border-strong); border-radius: var(--radius-pill);
    background: rgba(255,255,255,0.04); padding: 5px 5px 5px 16px;
  }
  .news-form:focus-within { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(215,245,66,0.12); }
  .news-form input {
    flex: 1; min-width: 0; border: none; background: transparent;
    color: var(--text); font-size: 0.85rem; outline: none;
  }
  .news-form input::placeholder { color: var(--text-muted); }
  .news-form button {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    border: none; background: var(--lime); color: #101503;
    display: grid; place-items: center; cursor: pointer;
    transition: transform var(--duration-normal) var(--ease-out);
  }
  .news-form button:hover { transform: scale(1.08); }
  .news-ok {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--lime); font-weight: 700; font-size: 0.88rem; margin: 0;
  }
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  .footer-bottom {
    border-top: 1px solid var(--border);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    color: var(--text-muted);
    font-size: 0.813rem;
  }

  .rawg-credit a {
    color: inherit;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .rawg-credit a:hover {
    color: var(--lime);
  }
  .footer-bottom :global(svg) { vertical-align: -2px; }

  @media (max-width: 900px) {
    .footer-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
    }
  }

  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .footer-brand {
      text-align: left;
    }

    .footer-bottom {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .footer {
      padding: 32px 0 16px;
    }

    .footer-container {
      width: min(100% - 24px, 100%);
    }

    .footer-grid {
      gap: 24px;
      margin-bottom: 32px;
    }
  }
</style>
