<script>
  import { X, ExternalLink, Check } from 'lucide-svelte';
  import { toggleWishlist, isInWishlist, wishlist } from './wishlist.js';
  import { getGameDetails, getGameScreenshots } from './api.js';

  /**
   * @typedef {import('./api.js').Game} Game
   */

  /**
   * @typedef {Object} GameModalProps
   * @property {Game | null} game
   * @property {boolean} open
   * @property {() => void} onClose
   */
  /** @type {GameModalProps} */
  let { game = null, open = false, onClose = () => {} } = $props();
  
  let inList = $derived(game && isInWishlist($wishlist, game));
  let activeTab = $state('overview');
  /** @type {Game | null} */
  let fullDetails = $state(null);
  /** @type {import('./api.js').Screenshot[]} */
  let screenshots = $state([]);
  let loadingDetails = $state(false);
  let currentGameId = $state(/** @type {number | null} */ (null));
  let requestToken = 0;

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      onClose();
    }
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

  async function loadGameDetails() {
    if (!game || !open || fullDetails) return;

    const token = ++requestToken;
    loadingDetails = true;
    try {
      const [details, shots] = await Promise.all([
        getGameDetails(game.id),
        getGameScreenshots(game.id)
      ]);

      if (token !== requestToken) {
        return;
      }

      fullDetails = details;
      screenshots = shots;
    } catch (error) {
      console.error('Failed to load game details:', error);
    } finally {
      if (token === requestToken) {
        loadingDetails = false;
      }
    }
  }

  $effect(() => {
    if (!open || !game) {
      currentGameId = null;
      activeTab = 'overview';
      fullDetails = null;
      screenshots = [];
      loadingDetails = false;
      requestToken++;
      return;
    }

    if (currentGameId !== game.id) {
      currentGameId = game.id;
      activeTab = 'overview';
      fullDetails = null;
      screenshots = [];
    }

    void loadGameDetails();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

  {#if open && game}
  <div class="modal-backdrop" role="presentation" onclick={onClose}></div>

  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <!-- Background -->
    <div class="modal-bg">
      {#if game.background_image}
        <img src={game.background_image} alt="" />
      {:else}
        <div class="modal-bg-fallback">{game.name.slice(0, 2).toUpperCase()}</div>
      {/if}
      <div class="modal-bg-overlay"></div>
    </div>

    <!-- Content -->
    <div class="modal-content">
      <div class="modal-close">
        <button onclick={onClose} aria-label="Fechar"><X size={20} /></button>
      </div>

      <!-- Header -->
      <div class="modal-header">
        {#if game.background_image}
          <img src={game.background_image} alt={game.name} class="modal-cover" />
        {:else}
          <div class="modal-cover-fallback">{game.name.slice(0, 2).toUpperCase()}</div>
        {/if}

        <div class="modal-title-section">
          <h2 id="modal-title" class="modal-title">{game.name}</h2>
          
          {#if game.genres && game.genres.length > 0}
            <p class="modal-genres">{formatGenres(game.genres)}</p>
          {/if}

          <div class="modal-quickmeta">
            <div class="qmeta-item">
              <span class="qmeta-label">Rating</span>
              <strong class="qmeta-value">{game.rating ? game.rating.toFixed(1) : '—'} ★</strong>
            </div>
            {#if fullDetails?.metacritic}
              <div class="qmeta-item">
                <span class="qmeta-label">Metacritic</span>
                <strong class="qmeta-value" style="color: {fullDetails.metacritic >= 75 ? '#10b981' : fullDetails.metacritic >= 50 ? '#f59e0b' : '#ef4444'}">{fullDetails.metacritic}</strong>
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
      <div class="modal-tabs">
        <button
          class="modal-tab"
          class:active={activeTab === 'overview'}
          onclick={() => (activeTab = 'overview')}
        >
          Visão Geral
        </button>
        <button
          class="modal-tab"
          class:active={activeTab === 'specs'}
          onclick={() => (activeTab = 'specs')}
        >
          Especificações
        </button>
        {#if screenshots.length > 0}
          <button
            class="modal-tab"
            class:active={activeTab === 'gallery'}
            onclick={() => (activeTab = 'gallery')}
          >
            Galeria
          </button>
        {/if}
      </div>

      <!-- Body -->
      <div class="modal-body">
        {#if loadingDetails && !fullDetails}
          <div class="loading-state">
            <div class="loader"></div>
            <p>Carregando detalhes...</p>
          </div>
        {:else if activeTab === 'overview'}
          <div class="tab-content">
            {#if fullDetails?.description_raw}
              <h3>Descrição</h3>
              <p>{stripHtml(fullDetails.description_raw).slice(0, 300)}...</p>
            {/if}

            {#if game.genres && game.genres.length > 0}
              <h3>Gêneros</h3>
              <div class="genre-list">
                {#each game.genres as genre (genre.id)}
                  <span class="genre-badge">{genre.name}</span>
                {/each}
              </div>
            {/if}

            {#if fullDetails?.platforms && fullDetails.platforms.length > 0}
              <h3>Plataformas</h3>
              <div class="platform-list">
                {#each fullDetails.platforms.slice(0, 6) as platform (platform.platform.id)}
                  <span class="platform-badge">{platform.platform.name}</span>
                {/each}
                {#if fullDetails.platforms.length > 6}
                  <span class="platform-badge">+{fullDetails.platforms.length - 6}</span>
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

            {#if fullDetails?.developers && fullDetails.developers.length > 0}
              <div class="spec-item">
                <span class="spec-label">Desenvolvedora{fullDetails.developers.length > 1 ? 's' : ''}</span>
                <strong class="spec-value">{formatList(fullDetails.developers)}</strong>
              </div>
            {/if}

            {#if fullDetails?.publishers && fullDetails.publishers.length > 0}
              <div class="spec-item">
                <span class="spec-label">Publicadora{fullDetails.publishers.length > 1 ? 's' : ''}</span>
                <strong class="spec-value">{formatList(fullDetails.publishers)}</strong>
              </div>
            {/if}

            {#if fullDetails?.esrb_rating}
              <div class="spec-item">
                <span class="spec-label">Classificação</span>
                <strong class="spec-value">{fullDetails.esrb_rating.name}</strong>
              </div>
            {/if}

            {#if fullDetails?.playtime}
              <div class="spec-item">
                <span class="spec-label">Tempo Médio</span>
                <strong class="spec-value">{fullDetails.playtime} horas</strong>
              </div>
            {/if}

            {#if fullDetails?.metacritic}
              <div class="spec-item">
                <span class="spec-label">Pontuação Metacritic</span>
                <strong class="spec-value" style="color: {fullDetails.metacritic >= 75 ? '#10b981' : fullDetails.metacritic >= 50 ? '#f59e0b' : '#ef4444'}">{fullDetails.metacritic}/100</strong>
              </div>
            {/if}

            <div class="spec-item">
              <span class="spec-label">Rating RAWG</span>
              <strong class="spec-value">{game.rating ? game.rating.toFixed(1) : '—'} / 5</strong>
            </div>

            {#if fullDetails?.achievements_count}
              <div class="spec-item">
                <span class="spec-label">Conquistas</span>
                <strong class="spec-value">{fullDetails.achievements_count}</strong>
              </div>
            {/if}

            {#if fullDetails?.website}
              <div class="spec-item full-width">
                <span class="spec-label">Site Oficial</span>
                <a href={fullDetails.website} target="_blank" rel="noopener" class="spec-link">
                  <span>Visitar Website</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            {/if}
          </div>
        {:else if activeTab === 'gallery' && screenshots.length > 0}
          <div class="screenshots-grid">
            {#each screenshots as screenshot (screenshot.id)}
              <img
                src={screenshot.image}
                alt="Screenshot"
                class="screenshot"
                loading="lazy"
              />
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-modal-close" onclick={onClose}>Voltar</button>
        <button
          class="btn-modal-wishlist"
          class:added={inList}
          onclick={() => {
            if (game) toggleWishlist(game);
          }}
        >
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
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    animation: fade-in var(--duration-normal) var(--ease-out);
  }

  .modal {
    position: fixed;
    inset: 0;
    z-index: 201;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
    animation: scale-up var(--duration-smooth) var(--ease-out);
  }

  .modal-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: var(--radius-xl);
  }

  .modal-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.3) blur(2px);
  }

  .modal-bg-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: 700;
    background: var(--surface-strong);
  }

  .modal-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(27, 40, 56, 0.98) 0%,
      rgba(27, 40, 56, 0.85) 50%,
      rgba(27, 40, 56, 0.98) 100%
    );
  }

  .modal-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 700px;
    border-radius: var(--radius-xl);
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2;
  }

  .modal-close button {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: rgba(10, 14, 19, 0.85);
    color: var(--text-muted);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .modal-close button:hover {
    border-color: var(--accent-bright);
    color: var(--accent-bright);
    background: rgba(102, 192, 244, 0.15);
  }

  .modal-header {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 18px;
    padding: 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-cover {
    width: 140px;
    height: 200px;
    border-radius: var(--radius-lg);
    object-fit: cover;
    border: 1px solid var(--border);
  }

  .modal-cover-fallback {
    width: 140px;
    height: 200px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--surface-strong);
    border: 1px solid var(--border);
    color: var(--text-soft);
  }

  .modal-title-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
  }

  .modal-title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text);
    font-family: "Space Grotesk", sans-serif;
  }

  .modal-genres {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .modal-quickmeta {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }

  .qmeta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .qmeta-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .qmeta-value {
    font-size: 0.95rem;
    color: var(--text);
    font-family: "Space Grotesk", sans-serif;
  }

  .modal-tabs {
    display: grid;
    grid-auto-flow: column;
    border-bottom: 1px solid var(--border);
    gap: 0;
  }

  .modal-tab {
    border: none;
    background: transparent;
    color: var(--text-muted);
    padding: 14px 16px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
    border-bottom: 2px solid transparent;
  }

  .modal-tab:hover {
    color: var(--text);
    background: rgba(102, 192, 244, 0.05);
  }

  .modal-tab.active {
    color: var(--accent-bright);
    border-bottom-color: var(--accent-bright);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
  }

  .loader {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(102, 192, 244, 0.2);
    border-top-color: var(--accent-bright);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    font-family: "Space Grotesk", sans-serif;
    word-break: break-word;
  }

  .spec-link {
    font-size: 0.95rem;
    color: var(--accent-bright);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--duration-fast) var(--ease-in-out);
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
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .screenshot {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform var(--duration-fast) var(--ease-in-out);
  }

  .screenshot:hover {
    transform: scale(1.03);
  }

  .modal-footer {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: rgba(var(--rgb-surface), 0.5);
  }

  .btn-modal-close,
  .btn-modal-wishlist {
    border: none;
    border-radius: var(--radius-md);
    padding: 12px 14px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
  }

  .btn-modal-close {
    background: rgba(var(--rgb-surface), 0.6);
    color: var(--text-muted);
    border: 1px solid var(--border-strong);
  }

  .btn-modal-close:hover {
    background: var(--surface-strong);
    border-color: var(--border-accent);
    color: var(--accent-bright);
  }

  .btn-modal-wishlist {
    background: var(--surface-strong);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--border);
    box-shadow: none;
  }

  .btn-modal-wishlist:hover {
    background: var(--surface-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  .btn-modal-wishlist.added {
    background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 12px rgba(143, 185, 70, 0.3);
  }

  @media (max-width: 640px) {
    .modal {
      align-items: flex-start;
      padding-top: 40px;
    }

    .modal-content {
      max-height: 100vh;
      border-radius: var(--radius-lg);
    }

    .modal-header {
      grid-template-columns: 1fr;
    }

    .modal-cover,
    .modal-cover-fallback {
      width: 100%;
      height: 240px;
    }

    .modal-title {
      font-size: 1.3rem;
    }

    .modal-quickmeta {
      grid-template-columns: 1fr 1fr;
    }

    .modal-footer {
      grid-template-columns: 1fr;
    }

    .specs-grid {
      grid-template-columns: 1fr;
    }

    .screenshots-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
  }
</style>
