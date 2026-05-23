<script>
  import { X, ExternalLink, Check } from 'lucide-svelte';
  import { toggleWishlist, isInWishlist, wishlist } from '$lib/wishlist.js';
  import OptimizedImage from '$lib/OptimizedImage.svelte';

  /** @type {{ data: { game: any, screenshots: any[], error?: string } }} */
  let { data } = $props();

  let game = $derived(data.game);
  let screenshots = $derived(data.screenshots || []);
  let activeTab = $state('overview');
  let inList = $derived(game && isInWishlist($wishlist, game));

  /**
   * @param {Array<{ name: string }> | undefined} genres
   */
  function formatGenres(genres) {
    return genres?.map((g) => g.name).join(' · ') || 'Sem informação';
  }

  /**
   * @param {Array<{ name: string }> | undefined} items
   */
  function formatList(items) {
    return items?.map((item) => item.name || item).join(', ') || 'N/A';
  }

  /**
   * @param {string | undefined} date
   */
  function formatDate(date) {
    if (!date) return 'TBA';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Strip HTML tags
   * @param {string} html
   */
  function stripHtml(html) {
    return html?.replace(/<[^>]*>/g, '') || '';
  }

  function handleToggleWishlist() {
    if (game) toggleWishlist(game);
  }

  function goBack() {
    history.back();
  }
  </script>

<svelte:head>
  {#if game}
    <title>{game.name} | GameWishlist</title>
    <meta name="description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta property="og:title" content={game.name} />
    <meta property="og:description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta property="og:type" content="video.game" />
    <meta property="og:url" content="https://gamewishlist.vercel.app/game/{game.id}" />
    <meta property="og:image" content={game.background_image || 'https://gamewishlist.vercel.app/logo.png'} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={game.name} />
    <meta name="twitter:description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta name="twitter:image" content={game.background_image || 'https://gamewishlist.vercel.app/logo.png'} />
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: game.name,
        description: stripHtml(game.description_raw || ''),
        image: game.background_image || 'https://gamewishlist.vercel.app/logo.png',
        genre: game.genres?.map(g => g.name) || [],
        datePublished: game.released || null,
        aggregateRating: game.rating ? {
          '@type': 'AggregateRating',
          ratingValue: game.rating,
          bestRating: 5,
        } : undefined,
      })}
    </script>
  {/if}
</svelte:head>

  {#if data.error || !game}
  <div class="error-container">
      <div class="error-state">
      <span class="error-icon">⚠️</span>
      <h2>Jogo não encontrado</h2>
      <p>{data.error || 'Este jogo não existe ou ocorreu um erro ao carregar.'}</p>
      <button class="back-btn" onclick={goBack}>Voltar</button>
    </div>
  </div>
{:else}
  <div class="page-container">
    <!-- Background -->
    <div class="page-bg">
      {#if game.background_image}
        <img src={game.background_image} alt="" />
      {/if}
      <div class="page-bg-overlay"></div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <button class="back-link" onclick={goBack}>
        <X size={16} />
        Voltar
      </button>

      <div class="game-header">
        {#if game.background_image}
          <OptimizedImage src={game.background_image} alt={game.name} aspectRatio="2/3" />
        {:else}
          <div class="game-cover-fallback">{game.name.slice(0, 2).toUpperCase()}</div>
        {/if}

        <div class="game-title-section">
          <h1 class="game-title">{game.name}</h1>

          {#if game.genres && game.genres.length > 0}
            <p class="game-genres">{formatGenres(game.genres)}</p>
          {/if}

          <div class="game-quickmeta">
            <div class="qmeta-item">
              <span class="qmeta-label">Rating</span>
              <strong class="qmeta-value">{game.rating ? game.rating.toFixed(1) : '—'} ★</strong>
            </div>
            {#if game.metacritic}
              <div class="qmeta-item">
                <span class="qmeta-label">Metacritic</span>
                <strong
                  class="qmeta-value"
                  style="color: {game.metacritic >= 75 ? '#10b981' : game.metacritic >= 50 ? '#f59e0b' : '#ef4444'}"
                >
                  {game.metacritic}
                </strong>
              </div>
            {/if}
            <div class="qmeta-item">
              <span class="qmeta-label">Lançado</span>
              <strong class="qmeta-value">{game.released ? game.released.split('-')[0] : 'TBA'}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="game-tabs">
        <button class="game-tab" class:active={activeTab === 'overview'} onclick={() => (activeTab = 'overview')}>
          Visão Geral
        </button>
        <button class="game-tab" class:active={activeTab === 'specs'} onclick={() => (activeTab = 'specs')}>
          Especificações
        </button>
        {#if screenshots.length > 0}
          <button class="game-tab" class:active={activeTab === 'gallery'} onclick={() => (activeTab = 'gallery')}>
            Galeria
          </button>
        {/if}
      </div>

      <!-- Body -->
      <div class="game-body">
        {#if activeTab === 'overview'}
          <div class="tab-content">
            {#if game.description_raw}
              <h3>Descrição</h3>
              <p>{stripHtml(game.description_raw).slice(0, 500)}{game.description_raw.length > 500 ? '...' : ''}</p>
            {/if}

            {#if game.genres && game.genres.length > 0}
              <h3>Gêneros</h3>
              <div class="genre-list">
                {#each game.genres as genre (genre.id)}
                  <span class="genre-badge">{genre.name}</span>
                {/each}
              </div>
            {/if}

            {#if game.platforms && game.platforms.length > 0}
              <h3>Plataformas</h3>
              <div class="platform-list">
                {#each game.platforms.slice(0, 6) as platform (platform.platform.id)}
                  <span class="platform-badge">{platform.platform.name}</span>
                {/each}
                {#if game.platforms.length > 6}
                  <span class="platform-badge">+{game.platforms.length - 6}</span>
                {/if}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'specs'}
          <div class="tab-content specs-grid">
            <div class="spec-item">
              <span class="spec-label">Data de Lançamento</span>
              <strong class="spec-value">{game.released ? formatDate(game.released) : 'TBA'}</strong>
            </div>

            {#if game.developers && game.developers.length > 0}
              <div class="spec-item">
                <span class="spec-label">Desenvolvedora{game.developers.length > 1 ? 's' : ''}</span>
                <strong class="spec-value">{formatList(game.developers)}</strong>
              </div>
            {/if}

            {#if game.publishers && game.publishers.length > 0}
              <div class="spec-item">
                <span class="spec-label">Publicadora{game.publishers.length > 1 ? 's' : ''}</span>
                <strong class="spec-value">{formatList(game.publishers)}</strong>
              </div>
            {/if}

            {#if game.esrb_rating}
              <div class="spec-item">
                <span class="spec-label">Classificação</span>
                <strong class="spec-value">{game.esrb_rating.name}</strong>
              </div>
            {/if}

            {#if game.playtime}
              <div class="spec-item">
                <span class="spec-label">Tempo Médio</span>
                <strong class="spec-value">{game.playtime} horas</strong>
              </div>
            {/if}

            {#if game.metacritic}
              <div class="spec-item">
                <span class="spec-label">Pontuação Metacritic</span>
                <strong
                  class="spec-value"
                  style="color: {game.metacritic >= 75 ? '#10b981' : game.metacritic >= 50 ? '#f59e0b' : '#ef4444'}"
                >
                  {game.metacritic}/100
                </strong>
              </div>
            {/if}

            <div class="spec-item">
              <span class="spec-label">Rating RAWG</span>
              <strong class="spec-value">{game.rating ? game.rating.toFixed(1) : '—'} / 5</strong>
            </div>

            {#if game.achievements_count}
              <div class="spec-item">
                <span class="spec-label">Conquistas</span>
                <strong class="spec-value">{game.achievements_count}</strong>
              </div>
            {/if}

            {#if game.website}
              <div class="spec-item full-width">
                <span class="spec-label">Site Oficial</span>
                <a href={game.website} target="_blank" rel="noopener" class="spec-link">
                  <span>Visitar Website</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            {/if}
          </div>
        {:else if activeTab === 'gallery' && screenshots.length > 0}
          <div class="screenshots-grid">
            {#each screenshots as screenshot (screenshot.id)}
               <OptimizedImage src={screenshot.image} alt="Screenshot" loading="lazy" />
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="game-footer">
        <button class="btn-back" onclick={goBack}>Voltar</button>
        <button class="btn-wishlist" class:added={inList} onclick={handleToggleWishlist}>
          {#if inList}
            <Check size={18} />
            <span>Na Wishlist</span>
          {:else}
            <span>+ Adicionar</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .error-container {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    color: var(--text-muted);
  }

  .error-icon {
    font-size: 3rem;
  }

  .error-state h2 {
    margin: 0;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
  }

  .back-btn {
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    background: var(--accent);
    color: #ffffff;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .back-btn:hover {
    background: var(--accent-bright);
    transform: translateY(-1px);
  }

  .page-container {
    position: relative;
    min-height: 100vh;
  }

  .page-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .page-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.25) saturate(1.2) blur(4px);
  }

  .page-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 25, 0.97) 0%,
      rgba(15, 20, 25, 0.9) 50%,
      rgba(26, 35, 50, 0.95) 100%
    );
  }

  .page-content {
    position: relative;
    z-index: 1;
    width: min(900px, calc(100% - 32px));
    margin: 0 auto;
    padding: 40px 0 60px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
    padding: 0;
  }

  .back-link:hover {
    color: var(--accent-bright);
  }

  .game-header {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
  }

  /* The .game-cover class was previously used to size the OptimizedImage wrapper.
   * Since OptimizedImage now handles sizing via the aspectRatio prop and the
   * wrapper inherits its container's dimensions, the explicit .game-cover rules are
   * no longer needed and have been removed to silence Vite warnings. */

  .game-cover-fallback {
    width: 200px;
    height: 280px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: 700;
    background: var(--surface-strong);
    border: 1px solid var(--border);
    color: var(--text-soft);
  }

  .game-title-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .game-title {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 800;
    color: var(--text-strong);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.1;
  }

  .game-genres {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .game-quickmeta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .qmeta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .qmeta-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .qmeta-value {
    font-size: 1.05rem;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
  }

  .game-tabs {
    display: grid;
    grid-auto-flow: column;
    border-bottom: 1px solid var(--border);
    gap: 0;
  }

  .game-tab {
    border: none;
    background: transparent;
    color: var(--text-muted);
    padding: 14px 16px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    border-bottom: 2px solid transparent;
  }

  .game-tab:hover {
    color: var(--text);
    background: rgba(102, 192, 244, 0.05);
  }

  .game-tab.active {
    color: var(--accent-bright);
    border-bottom-color: var(--accent-bright);
  }

  .game-body {
    min-height: 200px;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tab-content h3 {
    margin: 8px 0 10px 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .tab-content p {
    margin: 0;
    line-height: 1.6;
    color: rgba(240, 244, 249, 0.85);
    font-size: 0.95rem;
  }

  .genre-list,
  .platform-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .genre-badge,
  .platform-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: var(--radius-xs);
    background: var(--surface-strong);
    border: 1px solid var(--surface-hover);
    color: var(--text-soft);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .spec-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border-radius: var(--radius-md);
    background: rgba(102, 192, 244, 0.05);
    border: 1px solid var(--border);
  }

  .spec-item.full-width {
    grid-column: 1 / -1;
  }

  .spec-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .spec-value {
    font-size: 1rem;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    word-break: break-word;
  }

  .spec-link {
    font-size: 0.95rem;
    color: var(--accent-bright);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--duration-fast) var(--ease-out);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .spec-link:hover {
    color: var(--accent-hover);
    text-decoration: underline;
  }

  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  /* The screenshot images are now rendered via OptimizedImage, which already
   * provides appropriate sizing and aspect‑ratio handling. The custom .screenshot
   * rules are therefore unnecessary and have been removed. */

  .game-footer {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 10px;
    padding: 16px 0 0;
    border-top: 1px solid var(--border);
  }

  .btn-back,
  .btn-wishlist {
    border: none;
    border-radius: var(--radius-md);
    padding: 12px 14px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .btn-back {
    background: rgba(var(--rgb-surface), 0.6);
    color: var(--text-muted);
    border: 1px solid var(--border-strong);
  }

  .btn-back:hover {
    background: var(--surface-strong);
    border-color: var(--border-accent);
    color: var(--accent-bright);
  }

  .btn-wishlist {
    background: var(--surface-strong);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--border);
  }

  .btn-wishlist:hover {
    background: var(--surface-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  .btn-wishlist.added {
    background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 12px rgba(143, 185, 70, 0.3);
  }

  @media (max-width: 768px) {
    .page-content {
      width: min(100% - 24px, 100%);
      padding: 24px 0 40px;
    }

    .game-header {
      grid-template-columns: 1fr;
    }

    .game-cover-fallback {
      width: 100%;
      height: 240px;
    }

    .game-title {
      font-size: clamp(1.5rem, 6vw, 2rem);
    }

    .game-quickmeta {
      grid-template-columns: 1fr 1fr;
    }

    .game-footer {
      grid-template-columns: 1fr;
    }

    .specs-grid {
      grid-template-columns: 1fr;
    }

    .screenshots-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }

  @media (max-width: 480px) {
    .game-tabs {
      grid-auto-flow: row;
    }

    .game-tab {
      padding: 12px;
      text-align: left;
    }
  }
</style>
