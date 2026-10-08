<script>
  import { ExternalLink, Check } from 'lucide-svelte';
  import { toggleWishlist, isInWishlist, wishlist } from '$lib/wishlist.js';
  import OptimizedImage from '$lib/OptimizedImage.svelte';

  /** @type {{ data: { game: any, screenshots: any[], additions: any[], series: any[], stores: any[], movies: any[], error?: string } }} */
  let { data } = $props();

  let game = $derived(data.game);
  let screenshots = $derived(data.screenshots || []);
  let additions = $derived(data.additions || []);
  let series = $derived(data.series || []);
  let stores = $derived(data.stores || []);
  let movies = $derived(data.movies || []);
  let activeTab = $state('overview');
  /** @type {string | null} */
  let lightbox = $state(null);
  let inList = $derived(game && isInWishlist($wishlist, game));
  let wishlistCount = $derived($wishlist.length);

  /**
   * @param {number | undefined | null} meta
   */
  function metaClass(meta) {
    if (meta == null) return '';
    if (meta >= 75) return 'meta-high';
    if (meta >= 50) return 'meta-mid';
    return 'meta-low';
  }

  /**
   * @param {number | undefined | null} meta
   */
  function metaRank(meta) {
    if (meta == null) return '—';
    if (meta >= 85) return 'S';
    if (meta >= 75) return 'A';
    if (meta >= 60) return 'B';
    return 'C';
  }

  /**
   * @param {number | undefined | null} n
   */
  function fmtNum(n) {
    if (n == null) return '—';
    return Number(n).toLocaleString('pt-BR');
  }

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

  // Quebra de avaliações RAWG (exceptional/recommended/meh/skip) — dado não usado antes
  let ratingBreakdown = $derived.by(() => {
    const ratings = game?.ratings;
    if (!Array.isArray(ratings) || ratings.length === 0) return [];
    const meta = [
      { title: 'exceptional', label: 'Obra-prima', cls: 'rb-exc' },
      { title: 'recommended', label: 'Recomendado', cls: 'rb-rec' },
      { title: 'meh', label: 'Mediano', cls: 'rb-meh' },
      { title: 'skip', label: 'Pule', cls: 'rb-skip' },
    ];
    return meta
      .map((m) => {
        const r = ratings.find((x) => x.title === m.title);
        return { ...m, percent: r?.percent ?? 0, count: r?.count ?? 0 };
      })
      .filter((r) => r.count > 0);
  });

  // Link da comunidade (Reddit) quando disponível
  let communityUrl = $derived(game?.reddit_url || null);

  /**
   * @param {KeyboardEvent} e
   */
  function onLightboxKey(e) {
    if (e.key === 'Escape') lightbox = null;
  }

  let trailer = $derived(
    movies?.[0]?.video || game?.clip?.clip || game?.clip?.video || null,
  );
  let trailerPoster = $derived(movies?.[0]?.preview || game?.background_image || '');
</script>

<svelte:window onkeydown={onLightboxKey} />

<svelte:head>
  {#if game}
    <title>{game.name} | Gamewish</title>
    <meta name="description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta property="og:title" content={game.name} />
    <meta property="og:description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta property="og:type" content="video.game" />
    <meta property="og:url" content="https://gamewishlist.vercel.app/game/{game.id}" />
    <meta property="og:image" content={game.background_image || 'https://gamewishlist.vercel.app/favicon-512.png'} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={game.name} />
    <meta name="twitter:description" content={stripHtml(game.description_raw || '').slice(0, 160)} />
    <meta name="twitter:image" content={game.background_image || 'https://gamewishlist.vercel.app/favicon-512.png'} />
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: game.name,
        description: stripHtml(game.description_raw || ''),
        image: game.background_image || 'https://gamewishlist.vercel.app/favicon-512.png',
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
      <button class="back-link" onclick={goBack} aria-label="Voltar para o catálogo">
        ← Voltar ao arcade
      </button>

      <div class="cinema-hero" aria-label="Apresentação do jogo">
        <div class="cinema-backdrop" aria-hidden="true">
          {#if game.background_image}
            <img src={game.background_image} alt="" loading="eager" />
          {/if}
          <span class="cinema-grain"></span>
        </div>
        <div class="cinema-card">
          <div class="poster-frame">
            {#if game.background_image}
              <OptimizedImage src={game.background_image} alt={game.name} aspectRatio="2/3" />
            {:else}
              <div class="game-cover-fallback">{game.name.slice(0, 2).toUpperCase()}</div>
            {/if}
            <span class="poster-tag">void · arcade</span>
            {#if game.metacritic}
              <span class="rank-chip {metaClass(game.metacritic)}">RANK {metaRank(game.metacritic)} · {game.metacritic}</span>
            {/if}
          </div>

          <div class="game-title-section">
            <p class="cinema-kicker">ficha cinematográfica</p>
            <h1 class="game-title">{game.name}</h1>

          {#if game.genres && game.genres.length > 0}
            <p class="game-genres">{formatGenres(game.genres)}</p>
          {/if}

          <div class="hud-bar" role="list" aria-label="HUD stats">
            <div class="hud-stat" role="listitem">
              <span class="hud-label">Nota</span>
              <strong class="hud-value">{game.rating ? game.rating.toFixed(1) : '—'} ★</strong>
              <span class="hud-sub">{fmtNum(game.ratings_count)} votos</span>
            </div>
            <div class="hud-stat" role="listitem">
              <span class="hud-label">Metacritic</span>
              <strong class="hud-value hud-meta {metaClass(game.metacritic)}">{game.metacritic ?? '—'}</strong>
              <span class="hud-sub">rank {metaRank(game.metacritic)}</span>
            </div>
            <div class="hud-stat" role="listitem">
              <span class="hud-label">Tempo</span>
              <strong class="hud-value">{game.playtime ? `${game.playtime}h` : '—'}</strong>
              <span class="hud-sub">média RAWG</span>
            </div>
            <div class="hud-stat" role="listitem">
              <span class="hud-label">Conquistas</span>
              <strong class="hud-value">{game.achievements_count ?? '—'}</strong>
              <span class="hud-sub">{fmtNum(game.added)} saves</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Tabs -->
      <div class="game-tabs" role="tablist">
        <button class="game-tab" class:active={activeTab === 'overview'} onclick={() => (activeTab = 'overview')} role="tab">
          Overview
        </button>
        <button class="game-tab" class:active={activeTab === 'specs'} onclick={() => (activeTab = 'specs')} role="tab">
          Ficha
        </button>
        <button class="game-tab" class:active={activeTab === 'gallery'} onclick={() => (activeTab = 'gallery')} role="tab">
          Galeria
        </button>
        <button class="game-tab" class:active={activeTab === 'extras'} onclick={() => (activeTab = 'extras')} role="tab">
          Extras
        </button>
      </div>

      <!-- Body -->
      <div class="game-body">
        {#if activeTab === 'overview'}
          <div class="tab-content">
            {#if trailer}
              <h3>Trailer</h3>
              <!-- svelte-ignore a11y_media_has_caption -->
              <video class="trailer" src={trailer} poster={trailerPoster} controls preload="none"></video>
            {/if}
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

            {#if ratingBreakdown.length > 0}
              <h3>Veredito da comunidade</h3>
              <div class="ratings-breakdown" role="list" aria-label="Distribuição de avaliações">
                {#each ratingBreakdown as r (r.title)}
                  <div class="rb-row {r.cls}" role="listitem">
                    <span class="rb-label">{r.label}</span>
                    <span class="rb-track"><span class="rb-fill" style="width: {r.percent}%"></span></span>
                    <span class="rb-pct">{Math.round(r.percent)}%</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if communityUrl}
              <a class="community-link" href={communityUrl} target="_blank" rel="noopener">
                <span>Discutir na comunidade</span>
                <ExternalLink size={14} />
              </a>
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
                  class="spec-value {game.metacritic >= 75 ? 'meta-high' : game.metacritic >= 50 ? 'meta-mid' : 'meta-low'}"
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
        {:else if activeTab === 'gallery'}
          {#if screenshots.length > 0}
            <div class="screenshots-grid">
              {#each screenshots as screenshot (screenshot.id)}
                <button class="shot-btn" onclick={() => (lightbox = screenshot.image)} aria-label="Expandir screenshot">
                  <OptimizedImage src={screenshot.image} alt="Screenshot" loading="lazy" />
                </button>
              {/each}
            </div>
          {:else}
            <p class="muted">Sem screenshots disponíveis.</p>
          {/if}
        {:else if activeTab === 'extras'}
          <div class="tab-content extras">
            {#if trailer}
              <h3>Trailer</h3>
              <!-- svelte-ignore a11y_media_has_caption -->
              <video class="trailer" src={trailer} poster={trailerPoster} controls preload="none"></video>
            {/if}
            <h3>DLCs · Additions ({additions.length})</h3>
            {#if additions.length > 0}
              <div class="extras-grid">
                {#each additions.slice(0, 6) as dlc (dlc.id)}
                  <a class="extra-card" href="/game/{dlc.id}">
                    {#if dlc.background_image}<img src={dlc.background_image} alt="" loading="lazy" />{/if}
                    <span>{dlc.name}</span>
                  </a>
                {/each}
              </div>
            {:else}
              <p class="muted">Sem DLCs listadas.</p>
            {/if}
            <h3>Mesma série ({series.length})</h3>
            {#if series.length > 0}
              <div class="extras-grid">
                {#each series.slice(0, 6) as s (s.id)}
                  <a class="extra-card" href="/game/{s.id}">
                    {#if s.background_image}<img src={s.background_image} alt="" loading="lazy" />{/if}
                    <span>{s.name}</span>
                  </a>
                {/each}
              </div>
            {:else}
              <p class="muted">Sem títulos da série.</p>
            {/if}
            <h3>Lojas ({stores.length})</h3>
            {#if stores.length > 0}
              <div class="stores-list">
                {#each stores as st (st.id)}
                  {#if st.url}
                    <a class="store-link" href={st.url} target="_blank" rel="noopener">{st.name} ↗</a>
                  {:else}
                    <span class="store-link dim">{st.name}</span>
                  {/if}
                {/each}
              </div>
            {:else}
              <p class="muted">Sem links de loja.</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="game-footer sticky-cta" role="group" aria-label="Ações da wishlist">
        <button class="btn-back" onclick={goBack}>Voltar</button>
        <button class="btn-wishlist" class:added={inList} onclick={handleToggleWishlist}>
          {#if inList}
            <Check size={18} />
            <span>Na Wishlist · {wishlistCount}</span>
          {:else}
            <span>+ Adicionar · {wishlistCount} na lista</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
  {#if lightbox}
    <button class="lightbox" onclick={() => (lightbox = null)} aria-label="Fechar imagem expandida">
      <img src={lightbox} alt="Screenshot expandida" />
      <span class="lightbox-hint">clique para fechar · esc</span>
    </button>
  {/if}
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
    background: var(--lime);
    color: #101503;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .back-btn:hover {
    background: var(--lime-soft);
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
    color: var(--lime);
  }

  .cinema-hero {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-xl);
    background: var(--surface);
  }

  .cinema-backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .cinema-backdrop img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.34;
    filter: saturate(1.15);
  }

  .cinema-grain {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(700px 260px at 18% 0%, rgba(139, 92, 246, 0.28), transparent 62%),
      linear-gradient(180deg, rgba(6, 8, 14, 0.55) 0%, rgba(6, 8, 14, 0.92) 100%);
  }

  .cinema-card {
    position: relative;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    padding: 24px;
  }

  .poster-frame {
    position: relative;
  }

  .poster-tag {
    position: absolute;
    left: 10px;
    bottom: 10px;
    padding: 6px 10px;
    border-radius: var(--radius-pill);
    background: rgba(6, 8, 14, 0.84);
    border: 1px solid var(--border-accent);
    color: var(--lime);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cinema-kicker {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--violet);
  }

  .cinema-card {
    position: relative;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    padding: 24px;
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

  .qmeta-value.meta-high, .spec-value.meta-high { color: var(--lime); }
  .qmeta-value.meta-mid, .spec-value.meta-mid { color: var(--gold); }
  .qmeta-value.meta-low, .spec-value.meta-low { color: var(--pink); }

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
    background: rgba(215, 245, 66, 0.06);
  }

  .game-tab.active {
    color: var(--lime);
    border-bottom-color: var(--lime);
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

  /* Veredito da comunidade — quebra de ratings RAWG */
  .ratings-breakdown {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 4px 0 4px;
  }

  .rb-row {
    display: grid;
    grid-template-columns: 108px 1fr 46px;
    align-items: center;
    gap: 12px;
  }

  .rb-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-soft);
  }

  .rb-track {
    height: 10px;
    border-radius: var(--radius-pill);
    background: var(--surface-strong);
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .rb-fill {
    display: block;
    height: 100%;
    border-radius: var(--radius-pill);
    transform-origin: left;
    animation: rb-grow 0.7s var(--ease-out) both;
    transition: width 0.4s var(--ease-out);
  }

  .rb-pct {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-muted);
    text-align: right;
  }

  .rb-exc .rb-fill { background: linear-gradient(90deg, var(--lime), #b6e21f); box-shadow: 0 0 12px rgba(215, 245, 66, 0.45); }
  .rb-rec .rb-fill { background: linear-gradient(90deg, var(--violet), #a78bfa); box-shadow: 0 0 12px rgba(139, 92, 246, 0.4); }
  .rb-meh .rb-fill { background: linear-gradient(90deg, var(--gold), #ffc75a); }
  .rb-skip .rb-fill { background: linear-gradient(90deg, var(--pink), #ff9ac4); }

  @keyframes rb-grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .community-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 10px 16px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-accent);
    color: var(--violet);
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    width: fit-content;
    transition:
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .community-link:hover {
    background: rgba(139, 92, 246, 0.12);
    border-color: var(--violet);
    transform: translateY(-1px);
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
    background: rgba(215, 245, 66, 0.05);
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
    color: var(--lime);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--duration-fast) var(--ease-out);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .spec-link:hover {
    color: var(--lime-soft);
    text-decoration: underline;
  }

  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .shot-btn {
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: transparent;
    cursor: zoom-in;
  }

  .hud-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 14px;
  }

  .hud-stat {
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    background: rgba(6, 8, 14, 0.72);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hud-label {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .hud-value { font-size: 1.15rem; color: var(--text); font-weight: 800; }
  .hud-meta.meta-high { color: var(--lime); }
  .hud-meta.meta-mid { color: var(--gold); }
  .hud-meta.meta-low { color: var(--pink); }
  .hud-sub { font-size: 0.75rem; color: var(--text-muted); }

  .rank-chip {
    margin-top: 8px;
    display: inline-flex;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--lime);
    color: var(--lime);
    background: rgba(215, 245, 66, 0.1);
  }
  .rank-chip.meta-mid { border-color: var(--gold); color: var(--gold); background: rgba(255, 178, 36, 0.12); }
  .rank-chip.meta-low { border-color: var(--pink); color: var(--pink); background: rgba(255, 106, 168, 0.12); }

  .trailer {
    width: 100%;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-accent);
    background: #000;
  }

  .muted { color: var(--text-muted); }
  .extras { display: flex; flex-direction: column; gap: 14px; }
  .extras-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
  }
  .extra-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--surface);
    color: var(--text);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .extra-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
  .extra-card span { display: block; padding: 8px 10px; }
  .extra-card:hover { border-color: var(--lime); }
  .stores-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .store-link {
    border: 1px solid var(--lime);
    color: var(--lime);
    border-radius: 999px;
    padding: 8px 14px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .store-link.dim { border-color: var(--border-strong); color: var(--text-muted); }

  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(2, 4, 8, 0.9);
    border: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    cursor: zoom-out;
  }
  .lightbox img { max-width: min(1100px, 92vw); max-height: 82vh; border-radius: 12px; border: 1px solid var(--lime); }
  .lightbox-hint { color: var(--lime); font-size: 0.8rem; margin-top: 10px; }

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
    color: var(--lime);
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
    background: var(--lime);
    color: #101503;
    border: 1px solid var(--lime);
    box-shadow: var(--shadow-lime);
  }

  .sticky-cta {
    position: sticky;
    bottom: 16px;
    z-index: 5;
    padding: 12px;
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-lg);
    background: rgba(6, 8, 14, 0.88);
    backdrop-filter: blur(14px);
  }

  @media (max-width: 768px) {
    .page-content {
      width: min(100% - 24px, 100%);
      padding: 24px 0 40px;
    }

    .cinema-card {
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
