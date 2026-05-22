<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getGamesByFilters, getAllGenres, getAllTags, getAllParentPlatforms } from '$lib/api.js';
  import { wishlist } from '$lib/wishlist.js';
  import Header from '$lib/Header.svelte';
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
  <title>GameWishlist | Wishlist de jogos</title>
  <meta name="description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local com interface refinada." />
  <meta property="og:title" content="GameWishlist | Wishlist de jogos" />
  <meta property="og:description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://gamewishlist.vercel.app/" />
  <meta property="og:image" content="https://gamewishlist.vercel.app/logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GameWishlist | Wishlist de jogos" />
  <meta name="twitter:description" content="Descubra jogos, pesquise por título e salve tudo em uma wishlist local." />
  <meta name="twitter:image" content="https://gamewishlist.vercel.app/logo.png" />
  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'GameWishlist',
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
    />

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
        <p>Seus jogos favoritos salvos no navegador.</p>
      </div>

      {#if $wishlist.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🎮</div>
          <h3>Sua wishlist está vazia</h3>
          <p>Abra a aba de exploração, escolha alguns jogos e volte para ver a coleção crescer.</p>
          <button class="btn-start" onclick={() => handleTabChange('explore')}>
            Começar Exploração
          </button>
        </div>
      {:else}
        <GameGrid
          games={$wishlist}
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

  .empty-icon {
    font-size: 3.5rem;
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

  .btn-start {
    margin-top: 8px;
    border: none;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    color: #051725;
    padding: 12px 18px;
    border-radius: var(--radius-lg);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-in-out);
    box-shadow: 0 8px 20px rgba(0, 217, 255, 0.2);
  }

  .btn-start:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 217, 255, 0.3);
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
