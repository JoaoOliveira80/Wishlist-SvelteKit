<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getGamesByFilters, getAllGenres, getAllTags, getAllParentPlatforms } from '$lib/api.js';
  import { wishlist } from '$lib/wishlist.js';
  import { getGenreColor } from '$lib/colors.js';
  import HeroSection from '$lib/HeroSection.svelte';
  import GameGrid from '$lib/GameGrid.svelte';

  let query = $state('');
  let games = $state(/** @type {any[]} */ ([]));
  let loading = $state(false);
  let error = $state('');
  let tab = $state('explore');
  let selectedGame = $state(null);
  let debounce = $state(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));
  let availableGenres = $state(/** @type {string[]} */ ([]));
  let availableTags = $state(/** @type {string[]} */ ([]));
  let availableParentPlatforms = $state(/** @type {string[]} */ ([]));
  let totalCount = $state(0);
  let currentPage = $state(1);
  const pageSize = 20;

  let exploreFilters = $state({
    genres: /** @type {string[]} */ ([]),
    tags: /** @type {string[]} */ ([]),
    parent_platforms: /** @type {string[]} */ ([]),
    ordering: '-rating',
    search_precise: false,
  });

  onMount(() => {
    const params = $page.url.searchParams;
    const urlQuery = params.get('q') || '';
    const urlGenres = params.get('genres')?.split(',').filter(Boolean) || [];
    const urlTags = params.get('tags')?.split(',').filter(Boolean) || [];
    const urlPlatforms = params.get('platforms')?.split(',').filter(Boolean) || [];
    const urlOrdering = params.get('sort') || '-rating';
    const urlPrecise = params.get('precise') === 'true';
    const urlPage = parseInt(params.get('page') || '1', 10);
    const urlTab = params.get('tab') || 'explore';

    if (urlQuery) query = urlQuery;
    if (urlGenres.length > 0) exploreFilters.genres = urlGenres;
    if (urlTags.length > 0) exploreFilters.tags = urlTags;
    if (urlPlatforms.length > 0) exploreFilters.parent_platforms = urlPlatforms;
    if (urlOrdering) exploreFilters.ordering = urlOrdering;
    if (urlPrecise) exploreFilters.search_precise = true;
    if (urlPage > 1) currentPage = urlPage;
    if (urlTab === 'wishlist') tab = 'wishlist';
  });

  // react to changes in the URL (e.g. when Header updates ?tab=... via goto)
  $effect(() => {
    const params = $page.url.searchParams;
    const urlTab = params.get('tab') || 'explore';
    tab = urlTab === 'wishlist' ? 'wishlist' : 'explore';
  });

  async function loadExploreGames() {
    loading = true;
    error = '';
    try {
      const trimmedQuery = query.trim();
      const result = await getGamesByFilters({
        search: trimmedQuery.length >= 2 ? trimmedQuery : undefined,
        genres: exploreFilters.genres,
        tags: exploreFilters.tags,
        parent_platforms: exploreFilters.parent_platforms,
        ordering: exploreFilters.ordering,
        search_precise: exploreFilters.search_precise,
        page: currentPage,
        page_size: pageSize,
      });
      games = result.results;
      totalCount = result.count;
    } catch (err) {
      console.error(err);
      error = 'Não foi possível carregar os jogos agora. Tente novamente em instantes.';
      games = [];
      totalCount = 0;
    } finally {
      loading = false;
    }
  }

  async function loadCatalogFilters() {
    try {
      const [genres, tags, parentPlatforms] = await Promise.all([
        getAllGenres(),
        getAllTags(),
        getAllParentPlatforms(),
      ]);
      availableGenres = genres.map((genre) => genre.name);
      availableTags = tags.map((tag) => tag.name);
      availableParentPlatforms = parentPlatforms.map((platform) => platform.name);
    } catch (err) {
      console.error('Failed to load filters catalog', err);
    }
  }

  onMount(() => {
    void loadCatalogFilters();
    void loadExploreGames();
  });

  function updateURL() {
    const params = new URLSearchParams();
    if (query.trim().length >= 2) params.set('q', query.trim());
    if (exploreFilters.genres.length > 0) params.set('genres', exploreFilters.genres.join(','));
    if (exploreFilters.tags.length > 0) params.set('tags', exploreFilters.tags.join(','));
    if (exploreFilters.parent_platforms.length > 0) params.set('platforms', exploreFilters.parent_platforms.join(','));
    if (exploreFilters.ordering !== '-rating') params.set('sort', exploreFilters.ordering);
    if (exploreFilters.search_precise) params.set('precise', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (tab !== 'explore') params.set('tab', tab);

    const queryString = params.toString();
    goto(queryString ? `?${queryString}` : '/', { replaceState: true, keepFocus: true });
  }

  /**
   * @param {string} searchValue
   */
  async function handleSearch(searchValue) {
    query = searchValue;
    currentPage = 1;
    updateURL();
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      if (tab === 'explore') {
        await loadExploreGames();
      }
    }, 250);
  }

  function retryLoadGames() {
    void loadExploreGames();
  }

  /**
   * @param {any[]} left
   * @param {any[]} right
   */
  function arraysEqual(left, right) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) return false;
    }
    return true;
  }

  /**
   * @param {typeof exploreFilters} nextFilters
   */
  function handleExploreFiltersChange(nextFilters) {
    const unchanged =
      exploreFilters.ordering === nextFilters.ordering
      && exploreFilters.search_precise === nextFilters.search_precise
      && arraysEqual(exploreFilters.genres, nextFilters.genres)
      && arraysEqual(exploreFilters.tags, nextFilters.tags)
      && arraysEqual(exploreFilters.parent_platforms, nextFilters.parent_platforms);

    if (unchanged) return;

    exploreFilters = { ...exploreFilters, ...nextFilters };
    currentPage = 1;
    updateURL();

    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      if (tab === 'explore') {
        await loadExploreGames();
      }
    }, 300);
  }

  /**
   * @param {number} newPage
   */
  function handlePageChange(newPage) {
    currentPage = Number(newPage);
    updateURL();
    void loadExploreGames();
  }

  /**
   * @param {string} newTab
   */
  function handleTabChange(newTab) {
    tab = newTab;
    if (newTab === 'wishlist') {
      query = '';
    }
    updateURL();
  }

  /**
   * @param {any} game
   */
  function handleGameDetails(game) {
    selectedGame = game;
  }

  let wishlistSort = $state('name');
  /** @type {HTMLInputElement | null} */
  let importInput = $state(null);

  let sortedWishlist = $derived.by(() => {
    const list = [...$wishlist];
    if (wishlistSort === 'rating') return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (wishlistSort === 'year')
      return list.sort((a, b) => (b.released ?? '').localeCompare(a.released ?? ''));
    return list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  });
  let wishlistAvg = $derived(getAverageRating($wishlist));
  let wishlistHours = $derived($wishlist.reduce((acc, g) => acc + (Number(g.playtime) || 0), 0));

  // Mix de generos da wishlist: barra empilhada colorida por genero
  let genreMix = $derived.by(() => {
    /** @type {Map<string, { name: string; count: number; color: string }>} */
    const counts = new Map();
    for (const g of $wishlist) {
      const name = g.genres?.[0]?.name || 'Outros';
      const key = name.toLowerCase();
      const prev = counts.get(key) || { name, count: 0, color: getGenreColor(name) };
      prev.count += 1;
      counts.set(key, prev);
    }
    const total = $wishlist.length || 1;
    return Array.from(counts.values())
      .map((g) => ({ ...g, pct: (g.count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  function exportWishlist() {
    const blob = new Blob([JSON.stringify($wishlist, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gamewish-wishlist.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * @param {Event} e
   */
  async function importWishlist(e) {
    const input = /** @type {HTMLInputElement} */ (e.target);
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((g) => g && typeof g.id !== 'undefined' && g.name);
      wishlist.update((list) => {
        const ids = new Set(list.map((g) => g.id));
        return [...list, ...valid.filter((g) => !ids.has(g.id))];
      });
    } catch (err) {
      console.error('Import failed', err);
    } finally {
      input.value = '';
    }
  }

  function clearWishlist() {
    if (confirm('Limpar toda a wishlist?')) wishlist.set([]);
  }

  /**
   * @param {any[]} gamesList
   */
  function getAverageRating(gamesList) {
    if (!gamesList || gamesList.length === 0) return 0;
    const total = gamesList.reduce((acc, game) => acc + (Number(game.rating) || 0), 0);
    return Number((total / gamesList.length).toFixed(1));
  }
</script>

<svelte:head>
  <title>Gamewish: sua wishlist de games</title>
  <meta name="description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local com interface refinada." />
  <meta property="og:title" content="Gamewish: sua wishlist de games" />
  <meta property="og:description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://gamewishlist.vercel.app/" />
  <meta property="og:image" content="https://gamewishlist.vercel.app/favicon-512.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Gamewish: sua wishlist de games" />
  <meta name="twitter:description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local." />
  <meta name="twitter:image" content="https://gamewishlist.vercel.app/favicon-512.png" />
  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Gamewish',
      description: 'Descubra jogos, pesquise por título e salve tudo em uma wishlist local.',
      url: 'https://gamewishlist.vercel.app',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
    })}
  </script>
  </svelte:head>

<main class="main-container" id="main-content" tabindex="-1">
  {#if tab === 'explore'}
    <HeroSection
      featuredGame={games[0]}
      gamesCount={totalCount}
      wishlistCount={$wishlist.length}
      avgRating={getAverageRating(games)}
      onExplore={() => handleTabChange('explore')}
      onWishlist={() => handleTabChange('wishlist')}
    />

    <div id="catalogo" class="catalog-toolbar" aria-label="Resumo do catálogo">
      <p class="toolbar-count" aria-live="polite">
        {#if loading}Sintonizando o arcade…
        {:else if totalCount > 0}{totalCount.toLocaleString('pt-BR')} títulos · página {currentPage}
        {:else}Catálogo pronto para explorar{/if}
      </p>
    </div>

    <GameGrid
      games={games}
      loading={loading}
      error={error}
      onGameDetails={handleGameDetails}
      searchQuery={query}
      {availableGenres}
      {availableTags}
      {availableParentPlatforms}
      onFiltersChange={handleExploreFiltersChange}
      {totalCount}
      {currentPage}
      onPageChange={handlePageChange}
      onRetry={retryLoadGames}
    />
  {:else}
    <section class="wishlist-container">
      <div class="wishlist-header">
        <h2>Minha Wishlist</h2>
        <p>Seus jogos favoritos, guardados no navegador e prontos para a próxima run.</p>
        {#if $wishlist.length > 0}
          <div class="dash-stats" role="list">
            <div class="dash-stat" role="listitem">
              <span class="dash-ico" aria-hidden="true">▣</span>
              <span class="dash-label">Total</span>
              <strong class="dash-value">{$wishlist.length}</strong>
            </div>
            <div class="dash-stat" role="listitem">
              <span class="dash-ico" aria-hidden="true">★</span>
              <span class="dash-label">Nota média</span>
              <strong class="dash-value">{wishlistAvg} <small>★</small></strong>
            </div>
            <div class="dash-stat" role="listitem">
              <span class="dash-ico" aria-hidden="true">◷</span>
              <span class="dash-label">Horas totais</span>
              <strong class="dash-value">{wishlistHours}<small>h</small></strong>
            </div>
          </div>

          {#if genreMix.length > 0}
            <div class="genre-mix" aria-label="Mix de generos da wishlist">
              <span class="mix-label">Mix de gêneros</span>
              <div class="mix-bar">
                {#each genreMix as g (g.name)}
                  <span
                    class="mix-seg"
                    style="width: {g.pct}%; background: {g.color};"
                    title="{g.name}: {g.count}"
                  ></span>
                {/each}
              </div>
              <div class="mix-legend">
                {#each genreMix as g (g.name)}
                  <span class="mix-item"><i style="background: {g.color}"></i>{g.name} ({g.count})</span>
                {/each}
              </div>
            </div>
          {/if}

          <div class="dash-actions">
            <label class="dash-sort">Ordenar
              <select bind:value={wishlistSort} aria-label="Ordenar wishlist">
                <option value="name">Nome</option>
                <option value="rating">Nota</option>
                <option value="year">Ano</option>
              </select>
            </label>
            <button class="btn-ghost sm" onclick={exportWishlist}>Exportar JSON</button>
            <button class="btn-ghost sm" onclick={() => importInput?.click()}>Importar</button>
            <input bind:this={importInput} type="file" accept="application/json" hidden onchange={importWishlist} />
            <button class="btn-danger sm" onclick={clearWishlist}>Limpar tudo</button>
          </div>
        {/if}
      </div>

      {#if $wishlist.length === 0}
        <div class="empty-state void-empty" role="status">
          <div class="empty-orbit" aria-hidden="true">
            <span class="orbit-ring"></span>
            <span class="orbit-core">◍</span>
          </div>
          <p class="empty-note">Wishlist vazia por aqui</p>
          <h3>Nenhum cartucho guardado ainda</h3>
          <p>Explore o catálogo, abra um destaque e salve os títulos que merecem uma segunda run.</p>
          <div class="empty-actions">
            <button class="btn-start" onclick={() => handleTabChange('explore')}>
              Começar Exploração
            </button>
            <a class="btn-ghost" href="#catalogo" onclick={() => handleTabChange('explore')}>Ver destaques</a>
          </div>
        </div>
      {:else}
        <GameGrid
          games={sortedWishlist}
          loading={false}
          error=""
          onGameDetails={handleGameDetails}
          showFilters={false}
        />
      {/if}
    </section>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
  }

  .main-container {
    width: min(1440px, calc(100% - 32px));
    margin: 0 auto;
    padding: 28px 0 80px;
  }

  .catalog-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 20px;
    margin: 4px 0 16px;
    padding: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
  }

  .toolbar-count {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .wishlist-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .wishlist-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wishlist-header h2 {
    font-family: "Space Grotesk", sans-serif;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--text);
  }

  .wishlist-header p {
    color: var(--text-muted);
    font-size: 1rem;
    margin: 0;
  }

  .dash-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .dash-stat {
    position: relative;
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-md);
    background:
      radial-gradient(240px 120px at 100% 0%, rgba(139, 92, 246, 0.12), transparent 70%),
      rgba(6, 8, 14, 0.6);
    padding: 14px 14px 12px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "ico label"
      "ico value";
    align-items: center;
    gap: 0 10px;
    overflow: hidden;
    transition: border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }
  .dash-stat:hover { border-color: var(--lime); transform: translateY(-2px); }
  .dash-ico {
    grid-area: ico;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: var(--radius-sm);
    background: rgba(215, 245, 66, 0.1);
    border: 1px solid rgba(215, 245, 66, 0.28);
    color: var(--lime);
    font-size: 1.1rem;
  }
  .dash-label {
    grid-area: label;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-muted);
  }
  .dash-value {
    grid-area: value;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.1;
  }
  .dash-value small { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

  /* Mix de gêneros */
  .genre-mix {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mix-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-soft);
  }
  .mix-bar {
    display: flex;
    height: 12px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    background: var(--surface-strong);
    border: 1px solid var(--border);
  }
  .mix-seg {
    height: 100%;
    transition: width var(--duration-normal) var(--ease-out);
    box-shadow: inset 0 0 0 1px rgba(6, 8, 14, 0.4);
  }
  .mix-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
  }
  .mix-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--text-soft);
  }
  .mix-item i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .dash-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
  .dash-sort { display: flex; gap: 8px; align-items: center; color: var(--text-muted); font-size: 0.85rem; }
  .dash-sort select {
    background: var(--surface-strong);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    padding: 8px 10px;
  }
  .btn-ghost.sm, .btn-danger.sm { padding: 8px 12px; font-size: 0.85rem; border-radius: 10px; cursor: pointer; }
  .btn-danger.sm { border: 1px solid var(--pink); color: var(--pink); background: transparent; }
  .btn-danger.sm:hover { background: rgba(255, 106, 168, 0.12); }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 60px 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    background: var(--surface);
    text-align: center;
  }

  .empty-state h3 {
    margin: 0;
    font-size: 1.4rem;
    color: var(--text);
    font-family: "Space Grotesk", sans-serif;
  }

  .empty-state p {
    margin: 0;
    color: var(--text-muted);
    max-width: 50ch;
  }

  /* Shape lock: botoes sempre pill, cards 20px, badges pequenos 6px */
  .btn-start {
    margin-top: 8px;
    border: 1px solid var(--lime);
    background: var(--lime);
    color: #101503;
    padding: 12px 22px;
    border-radius: var(--radius-pill);
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-in-out);
    box-shadow: var(--shadow-lime);
  }

  .btn-start:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lime);
  }

  .void-empty {
    position: relative;
    overflow: hidden;
    border-color: var(--border-accent);
    background:
      radial-gradient(420px 200px at 50% 0%, rgba(215, 245, 66, 0.12), transparent 65%),
      var(--surface);
  }

  .empty-note {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-soft);
  }

  .empty-orbit {
    position: relative;
    width: 112px;
    height: 112px;
    display: grid;
    place-items: center;
  }

  .orbit-ring {
    position: absolute;
    inset: 8px;
    border: 1px dashed rgba(215, 245, 66, 0.45);
    border-radius: 50%;
  }

  .orbit-core {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: var(--lime);
    color: #101503;
    font-size: 1.7rem;
    transform: rotate(-6deg);
    box-shadow: var(--shadow-lime);
  }

  .empty-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    padding: 12px 22px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-strong);
    color: var(--text);
    text-decoration: none;
    font-weight: 700;
    white-space: nowrap;
  }

  .btn-ghost:hover {
    border-color: var(--lime);
    color: var(--lime);
  }

  @media (max-width: 900px) {
    .main-container {
      width: min(100% - 20px, 100%);
      padding: 20px 0 60px;
    }
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 18px 0 48px;
    }

    .wishlist-header h2 {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 640px) {
    .main-container {
      padding: 16px 0 40px;
    }

    .wishlist-header h2 {
      font-size: 1.5rem;
    }

    .empty-state {
      padding: 40px 24px;
    }
  }
</style>
