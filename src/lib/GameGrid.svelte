<script>
  import { fly, fade } from 'svelte/transition';
  import { ChevronDown, Gamepad2, Tag, Monitor } from 'lucide-svelte';
  import GameCardNew from './GameCardNew.svelte';
  import SkeletonCard from './SkeletonCard.svelte';
  import GenreFilter from './GenreFilter.svelte';

  /**
   * @typedef {{
   *   id: number;
   *   name: string;
   *   rating?: number;
   *   metacritic?: number;
   *   updated?: string;
   *   released?: string;
   *   background_image?: string;
   *   genres?: Array<{ name: string }>;
   * }} Game
   */

  let {
    games = [],
    loading = false,
    error = '',
    onGameDetails = () => {},
    showFilters = true,
    searchQuery = '',
    availableGenres = [],
    availableTags = [],
    availableParentPlatforms = [],
    onFiltersChange = () => {},
    totalCount = 0,
    currentPage = 1,
    pageSize = 20,
    onPageChange = (/** @type {number} */ _p) => {},
    onRetry = (/** @type {MouseEvent} */ _e) => {},
  } = $props();

  let selectedGenres = $state(/** @type {string[]} */ ([]));
  let selectedTags = $state(/** @type {string[]} */ ([]));
  let selectedParentPlatforms = $state(/** @type {string[]} */ ([]));
  let searchPrecise = $state(false);
  let sortBy = $state('rating');
  let openFilter = $state(/** @type {'genres' | 'tags' | 'platforms' | null} */ (null));

  /**
   * @param {'genres' | 'tags' | 'platforms'} key
   * @param {boolean} nextOpen
   */
  function handleFilterOpenChange(key, nextOpen) {
    if (nextOpen) {
      openFilter = key;
      return;
    }

    if (openFilter === key) {
      openFilter = null;
    }
  }

  /** @param {boolean} nextOpen */
  function handleGenresOpenChange(nextOpen) {
    handleFilterOpenChange('genres', nextOpen);
  }

  /** @param {boolean} nextOpen */
  function handleTagsOpenChange(nextOpen) {
    handleFilterOpenChange('tags', nextOpen);
  }

  /** @param {boolean} nextOpen */
  function handlePlatformsOpenChange(nextOpen) {
    handleFilterOpenChange('platforms', nextOpen);
  }

  function getOrderingValue() {
    if (sortBy === 'metacritic') return '-metacritic';
    if (sortBy === 'added') return '-added';
    if (sortBy === 'recent') return '-released';
    if (sortBy === 'updated') return '-updated';
    if (sortBy === 'alpha') return 'name';
    return '-rating';
  }

  // Extract all unique genres when catalog lists are not provided
  let allGenres = $derived(
    availableGenres.length > 0
      ? availableGenres
      : Array.from(
          new Set(games.flatMap((g) => g.genres?.map((/** @type {{ name: string }} */ gen) => gen.name) || [])),
        ).sort(),
  );

  let allTags = $derived(availableTags);
  let allParentPlatforms = $derived(availableParentPlatforms);
  let hasActiveFilters = $derived(
    selectedGenres.length > 0
    || selectedTags.length > 0
    || selectedParentPlatforms.length > 0
    || searchPrecise,
  );

  let totalPages = $derived(Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 20))));
  let rankBase = $derived(((currentPage || 1) - 1) * (pageSize || 20));
  let shownCount = $derived(games?.length || 0);
  let activeFilterCount = $derived(
    selectedGenres.length + selectedTags.length + selectedParentPlatforms.length + (searchPrecise ? 1 : 0),
  );

  $effect(() => {
    onFiltersChange({
      genres: selectedGenres,
      tags: selectedTags,
      parent_platforms: selectedParentPlatforms,
      ordering: getOrderingValue(),
      search_precise: searchPrecise,
    });
  });

  /**
   * @param {'genre' | 'tag' | 'platform'} kind
   * @param {string} value
   */
  function removeFilterChip(kind, value) {
    if (kind === 'genre') {
      selectedGenres = selectedGenres.filter((item) => item !== value);
      return;
    }

    if (kind === 'tag') {
      selectedTags = selectedTags.filter((item) => item !== value);
      return;
    }

    selectedParentPlatforms = selectedParentPlatforms.filter((item) => item !== value);
  }

  function clearAllFilters() {
    selectedGenres = [];
    selectedTags = [];
    selectedParentPlatforms = [];
    searchPrecise = false;
  }
</script>

<div class="game-grid-container">
  {#if showFilters}
    <div class="arcade-toolbar" aria-label="Controles da lista">
      <div class="filters-bar">
      <GenreFilter
        genres={allGenres}
        {selectedGenres}
        onGenreChange={(/** @type {string[]} */ genres) => (selectedGenres = genres)}
        isOpen={openFilter === 'genres'}
        onOpenChange={handleGenresOpenChange}
        label="Gêneros"
        icon={Gamepad2}
      />

      {#if allTags.length > 0}
        <GenreFilter
          genres={allTags}
          selectedGenres={selectedTags}
          onGenreChange={(/** @type {string[]} */ tags) => (selectedTags = tags)}
          isOpen={openFilter === 'tags'}
          onOpenChange={handleTagsOpenChange}
          label="Tags"
          icon={Tag}
        />
      {/if}

      {#if allParentPlatforms.length > 0}
        <GenreFilter
          genres={allParentPlatforms}
          selectedGenres={selectedParentPlatforms}
          onGenreChange={(/** @type {string[]} */ platforms) => (selectedParentPlatforms = platforms)}
          isOpen={openFilter === 'platforms'}
          onOpenChange={handlePlatformsOpenChange}
          label="Plataformas"
          icon={Monitor}
        />
      {/if}

      <div class="sort-control">
        <label for="sort-select">Ordenar por:</label>
        <div class="select-wrapper">
          <select id="sort-select" bind:value={sortBy}>
            <option value="rating">Avaliação</option>
            <option value="added">Populares</option>
            <option value="metacritic">Metacritic</option>
            <option value="recent">Lançamento</option>
            <option value="updated">Atualização</option>
            <option value="alpha">A-Z</option>
          </select>
          <ChevronDown class="select-icon" size={16} />
        </div>
      </div>

      <label class="precision-control" for="precise-search">
        <input id="precise-search" type="checkbox" bind:checked={searchPrecise} />
        Busca precisa
      </label>
      </div>
      <span class="page-note">Página {currentPage} de {totalPages}</span>
    </div>

    <div class="count-strip" aria-live="polite">
      <span class="count-chip"><strong>{shownCount}</strong> nesta página</span>
      <span class="count-chip ghost"><strong>{totalCount}</strong> no catálogo</span>
    </div>

    {#if hasActiveFilters}
      <div class="active-filters" aria-live="polite">
        {#each selectedGenres as genre (genre)}
          <button class="filter-chip" in:fly={{ y: -10, duration: 200 }} out:fade={{ duration: 150 }} onclick={() => removeFilterChip('genre', genre)}>
            Gênero: {genre} <span aria-hidden="true">×</span>
          </button>
        {/each}

        {#each selectedTags as tag (tag)}
          <button class="filter-chip" in:fly={{ y: -10, duration: 200 }} out:fade={{ duration: 150 }} onclick={() => removeFilterChip('tag', tag)}>
            Tag: {tag} <span aria-hidden="true">×</span>
          </button>
        {/each}

        {#each selectedParentPlatforms as platform (platform)}
          <button class="filter-chip" in:fly={{ y: -10, duration: 200 }} out:fade={{ duration: 150 }} onclick={() => removeFilterChip('platform', platform)}>
            Plataforma: {platform} <span aria-hidden="true">×</span>
          </button>
        {/each}

        {#if searchPrecise}
          <button class="filter-chip" in:fly={{ y: -10, duration: 200 }} out:fade={{ duration: 150 }} onclick={() => (searchPrecise = false)}>
            Busca precisa <span aria-hidden="true">×</span>
          </button>
        {/if}

        <button class="clear-all" onclick={clearAllFilters}>Limpar filtros</button>
      </div>
    {/if}
  {/if}

  <div class="status-container" aria-live="polite">
    {#if loading}
      <div class="arcade-loading" in:fade={{ duration: 200 }}>
        <p class="loading-note">Carregando jogos...</p>
        <SkeletonCard count={12} />
      </div>
    {:else if error}
      <div class="error-state" in:fade={{ duration: 300 }}>
        <span class="error-icon">⚠️</span>
        <p class="error-text">{error}</p>
        <button class="retry-btn" onclick={(e) => onRetry(e)}>
          Tentar novamente
        </button>
      </div>
    {:else if games.length === 0}
      <div class="empty-state empty-arcade" in:fade={{ duration: 300 }}>
        <span class="empty-note">Sem jogos por aqui</span>
        <span class="empty-icon">
          <Gamepad2 size={40} />
        </span>
        <p class="empty-title">Nada por aqui… ainda.</p>
        <p class="empty-text">{selectedGenres.length > 0 ? 'Nenhum jogo encontrado para esses filtros.' : 'Nenhum jogo para exibir.'}</p>
        <button class="retry-btn retry-lime" onclick={clearAllFilters}>
          Limpar filtros e continuar jogando
        </button>
      </div>
    {:else}
      <div class="grid">
        {#each games as game, i (game.id)}
          <div class="grid-item" in:fly={{ y: 20, duration: 300, delay: i * 30 }}>
            <GameCardNew game={game} rank={rankBase + i + 1} onDetails={onGameDetails} />
          </div>
        {/each}
      </div>

      {#if totalPages > 1}
        <div class="pagination">
          <button
            class="pagination-btn"
            disabled={currentPage === 1}
            onclick={() => onPageChange(currentPage - 1)}
          >
            ← Anterior
          </button>

          <div class="pagination-info">
            <span class="page-number">Página {currentPage} de {totalPages}</span>
          </div>

          <button
            class="pagination-btn"
            disabled={currentPage === totalPages}
            onclick={() => onPageChange(currentPage + 1)}
          >
            Próxima →
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .game-grid-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .arcade-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background:
      radial-gradient(420px 120px at 8% 0%, rgba(215, 245, 66, 0.08), transparent 65%),
      radial-gradient(420px 140px at 92% 100%, rgba(139, 92, 246, 0.14), transparent 65%),
      #0e1422;
  }

  .page-note {
    margin-left: auto;
    color: var(--text-soft);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .loading-note {
    margin: 0 0 10px;
    color: var(--text-soft);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .filters-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    flex-wrap: wrap;
  }

  .count-strip {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .count-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    background: rgba(215, 245, 66, 0.08);
    border: 1px solid rgba(215, 245, 66, 0.28);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text-soft);
  }

  .count-chip strong {
    color: var(--lime);
  }

  .count-chip.ghost {
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.32);
  }

  .count-chip.ghost strong {
    color: var(--violet);
  }

  .sort-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sort-control label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .select-wrapper select {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-strong);
    color: var(--text);
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
    padding-right: 28px;
    appearance: none;
  }

  .select-wrapper select:hover {
    border-color: rgba(215, 245, 66, 0.45);
    background: var(--surface-hover);
  }

  .select-wrapper select:focus {
    outline: none;
    border-color: var(--lime);
    box-shadow: 0 0 0 2px rgba(215, 245, 66, 0.18);
  }

  :global(.select-icon) {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--text-muted);
  }

  .precision-control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .precision-control:hover {
    color: var(--text);
  }

  .precision-control input {
    width: 16px;
    height: 16px;
    accent-color: var(--lime);
    cursor: pointer;
  }

  .status-container {
    min-height: 280px;
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 0;
  }

  .filter-chip,
  .clear-all {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
  }

  .filter-chip {
    color: var(--lime);
    background: rgba(215, 245, 66, 0.08);
    border-color: rgba(215, 245, 66, 0.3);
  }

  .filter-chip:hover {
    border-color: var(--lime);
    color: #101503;
    background: var(--lime);
  }

  .clear-all {
    color: var(--pink);
    background: rgba(255, 106, 168, 0.08);
    border-color: rgba(255, 106, 168, 0.32);
  }

  .clear-all:hover {
    border-color: var(--pink);
    background: rgba(255, 106, 168, 0.16);
    color: var(--pink);
  }

  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    gap: 12px;
  }

  .error-state p,
  .empty-state p {
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .empty-arcade {
    border: 1px dashed rgba(215, 245, 66, 0.35);
    border-radius: var(--radius-lg);
    background:
      radial-gradient(420px 180px at 50% 0%, rgba(215, 245, 66, 0.1), transparent 65%),
      #0e1422;
    padding: 34px 24px;
  }

  .empty-note {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-soft);
  }

  .empty-title {
    font-family: var(--font-head);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text) !important;
  }

  .error-icon,
  .empty-icon {
    color: var(--violet);
    opacity: 0.9;
  }

  .error-state {
    color: var(--pink);
  }

  .retry-btn {
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    background: var(--pink);
    color: #16060f;
    font-size: 0.9rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .retry-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(255, 106, 168, 0.28);
  }

  .retry-lime {
    background: var(--lime);
    color: #101503;
    box-shadow: var(--shadow-lime);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
  }

  .grid-item {
    animation: stagger-children var(--duration-smooth) var(--ease-out) both;
  }

  @media (max-width: 1200px) {
    .grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1px));
      gap: 14px;
    }

    .arcade-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .page-note {
      margin-left: 0;
    }

    .filters-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .precision-control {
      justify-content: center;
    }

    .active-filters {
      justify-content: center;
    }

    .count-strip {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .arcade-toolbar {
      padding: 12px;
      gap: 10px;
    }

    .sort-control {
      flex: 1;
    }

    .sort-control select {
      width: 100%;
    }
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 14px;
    margin-top: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: #0e1422;
  }

  .pagination-btn {
    padding: 9px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-strong);
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .pagination-btn:not(:disabled):hover {
    border-color: var(--lime);
    background: var(--lime);
    color: #101503;
    transform: translateY(-1px);
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .page-number {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .pagination {
      gap: 12px;
      padding: 16px 12px;
    }

    .pagination-btn {
      padding: 8px 12px;
      font-size: 0.8rem;
    }

    .page-number {
      font-size: 0.85rem;
    }
  }

</style>
