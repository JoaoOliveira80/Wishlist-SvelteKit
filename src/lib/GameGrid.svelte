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

  let totalPages = $derived(Math.ceil(totalCount / pageSize));
</script>

<div class="game-grid-container">
  {#if showFilters}
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

      <!-- <div class="filter-info">
        {totalCount} jogos found
      </div> -->
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
      <div in:fade={{ duration: 200 }}>
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
      <div class="empty-state" in:fade={{ duration: 300 }}>
        <span class="empty-icon">
          <Gamepad2 size={40} />
        </span>
        <p class="empty-text">{selectedGenres.length > 0 ? 'Nenhum jogo encontrado para esses filtros.' : 'Nenhum jogo para exibir.'}</p>
      </div>
    {:else}
      <div class="grid">
        {#each games as game, i (game.id)}
          <div class="grid-item" in:fly={{ y: 20, duration: 300, delay: i * 30 }}>
            <GameCardNew {game} onDetails={onGameDetails} />
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
    gap: 20px;
  }

  .filters-bar {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    background: var(--surface);
    backdrop-filter: blur(10px);
    flex-wrap: wrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-strong);
    color: var(--text);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
    padding-right: 28px;
    appearance: none;
  }

  .select-wrapper select:hover {
    border-color: var(--border-accent);
    background: var(--surface-hover);
  }

  .select-wrapper select:focus {
    outline: none;
    border-color: var(--accent-bright);
    box-shadow: 0 0 0 2px rgba(102, 192, 244, 0.1);
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
    accent-color: var(--accent-bright);
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
    color: var(--text-soft);
    background: rgba(75, 163, 208, 0.08);
    border-color: rgba(102, 192, 244, 0.2);
  }

  .filter-chip:hover {
    border-color: var(--accent-bright);
    color: var(--accent-bright);
    background: rgba(102, 192, 244, 0.15);
  }

  .clear-all {
    color: var(--danger);
    background: rgba(231, 76, 60, 0.1);
    border-color: rgba(231, 76, 60, 0.3);
  }

  .clear-all:hover {
    border-color: rgba(231, 76, 60, 0.6);
    background: rgba(231, 76, 60, 0.2);
    color: #ff6b6b;
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

  .error-icon,
  .empty-icon {
    color: var(--text-muted);
    opacity: 0.5;
  }

  .error-state {
    color: var(--danger);
  }

  .retry-btn {
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    background: var(--danger);
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .retry-btn:hover {
    background: #ff6b6b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
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
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .filters-bar {
      padding: 12px 16px;
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
    gap: 24px;
    padding: 24px 20px;
    margin-top: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }

  .pagination-btn {
    padding: 10px 16px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-strong);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
  }

  .pagination-btn:not(:disabled):hover {
    border-color: var(--accent-bright);
    background: var(--surface-hover);
    color: var(--accent-bright);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 192, 244, 0.15);
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
