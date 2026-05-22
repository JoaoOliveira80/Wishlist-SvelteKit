<script>
  import { getGenreColorVar } from './colors.js';

  let {
    genres = [],
    selectedGenres = [],
    onGenreChange = () => {},
    isOpen = false,
    onOpenChange = () => {},
    label = 'Gêneros',
    icon = null
  } = $props();

  /** @param {string} genre */
  function toggleGenre(genre) {
    const isSelected = selectedGenres.includes(genre);
    const updated = isSelected
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    onGenreChange(updated);
  }

  function clearFilters() {
    onGenreChange([]);
    onOpenChange(false);
  }

  function toggleDropdown() {
    onOpenChange(!isOpen);
  }
</script>

<div class="genre-filter">
  <div class="filter-button" onclick={toggleDropdown} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(); }} role="button" tabindex="0">
    <span class="filter-content">
      {#if icon}
        {@const Icon = icon}
        <Icon size={18} />
      {/if}
      <span>{label}</span>
    </span>
    {#if selectedGenres.length > 0}
      <span class="badge">{selectedGenres.length}</span>
    {/if}
    <span class="icon" class:open={isOpen}>⌄</span>
  </div>

  {#if isOpen}
    <div class="dropdown" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
      <div class="dropdown-header">
        <span>Selecione {label.toLowerCase()}</span>
        {#if selectedGenres.length > 0}
          <button onclick={clearFilters} class="clear-btn">Limpar</button>
        {/if}
      </div>

      <div class="genres-grid">
        {#each genres as genre (genre)}
          <button
            class="genre-tag"
            class:selected={selectedGenres.includes(genre)}
            onclick={() => toggleGenre(genre)}
            style="--genre-color: {getGenreColorVar(genre)}"
          >
            {genre}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .genre-filter {
    position: relative;
  }

  .filter-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-strong);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-in-out);
  }

  .filter-button:hover {
    border-color: var(--border-accent);
    background: var(--surface-hover);
    color: var(--text-strong);
  }

  .filter-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  :global(.filter-content svg) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: var(--radius-sm);
    background: var(--accent-bright);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .icon {
    display: inline-flex;
    transition: transform var(--duration-fast) var(--ease-in-out);
    font-size: 0.75rem;
  }

  .icon.open {
    transform: rotateZ(180deg);
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1000;
    min-width: 280px;
    width: min(320px, calc(100vw - 24px));
    max-width: 100%;
    max-height: min(360px, calc(100vh - 120px));
    overflow: auto;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border-strong);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: scale-up var(--duration-normal) var(--ease-out);
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-soft);
  }

  .clear-btn {
    padding: 6px 10px;
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(231, 76, 60, 0.15);
    color: var(--danger);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
  }

  .clear-btn:hover {
    background: rgba(231, 76, 60, 0.25);
  }

  .genres-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px;
  }

  .genre-tag {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-in-out);
  }

  .genre-tag:hover {
    border-color: var(--genre-color);
    color: var(--accent-bright);
    background: rgba(102, 192, 244, 0.08);
  }

  .genre-tag.selected {
    border-color: var(--genre-color);
    background: rgba(from var(--genre-color) r g b / 0.15);
    color: var(--text-strong);
  }

  @media (max-width: 640px) {
    .dropdown {
      left: 0;
      right: auto;
      width: min(100vw - 24px, 320px);
    }

    .genres-grid {
      grid-template-columns: 1fr;
    }
  }
</style>