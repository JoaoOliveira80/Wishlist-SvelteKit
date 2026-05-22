<script>
  import { ExternalLink, Heart, Gamepad2 } from 'lucide-svelte';
</script>

<footer class="footer">
  <div class="footer-container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="brand-wrapper">
          <Gamepad2 size={24} />
          <span class="brand-name">GameWishlist</span>
        </div>
        <p class="brand-desc">Sua lista de desejos de games powered by RAWG API.</p>
      </div>

      <div class="footer-links">
        <h4>Navegação</h4>
        <ul>
          <li><a href="/">Explorar</a></li>
          <li><a href="/#wishlist">Wishlist</a></li>
          <li><a href="/">Início</a></li>
        </ul>
      </div>

      <div class="footer-links">
        <h4>Recursos</h4>
        <ul>
          <li><a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">RAWG API <ExternalLink size={12} /></a></li>
          <li><a href="https://svelte.dev" target="_blank" rel="noreferrer">SvelteKit <ExternalLink size={12} /></a></li>
          <li><a href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide Icons <ExternalLink size={12} /></a></li>
        </ul>
      </div>

      <div class="footer-links">
        <h4>Legal</h4>
        <ul>
          <li><a href="/">Termos de Uso</a></li>
          <li><a href="/">Privacidade</a></li>
          <li><a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG <ExternalLink size={12} /></a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© {new Date().getFullYear()} GameWishlist. Feito com <Heart size={14} /> usando SvelteKit.</p>
      <p class="rawg-credit">
        Dados fornecidos por <a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG <ExternalLink size={12} /></a>
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--surface);
    border-top: 1px solid rgba(var(--rgb-accent), 0.1);
    padding: 48px 0 24px;
    margin-top: auto;
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
    gap: 10px;
    margin-bottom: 12px;
    color: var(--accent-bright);
  }

  .brand-name {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .brand-desc {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .footer-links h4 {
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
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
    color: var(--accent-bright);
  }

  .footer-bottom {
    border-top: 1px solid rgba(var(--rgb-accent), 0.1);
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
    color: var(--accent-bright);
  }

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
      text-align: center;
    }

    .brand-wrapper {
      justify-content: center;
    }

    .footer-links {
      text-align: center;
    }

    .footer-links ul {
      align-items: center;
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
