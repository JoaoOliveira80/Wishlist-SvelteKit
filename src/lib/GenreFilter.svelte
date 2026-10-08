<script>
  import { getGenreColorVar } from './colors.js';

  let {
    options = [],
    selected = [],
    onChange = () => {},
    // Aliases legados (GameGrid antigo passava strings): mantidos por compatibilidade.
    genres = [],
    selectedGenres = [],
    onGenreChange = null,
    isOpen = false,
    onOpenChange = () => {},
    label = 'Gêneros',
    icon = null
  } = $props();

  // Normaliza para {value, label}; aceita o formato antigo de strings.
  let normOptions = $derived(
    options.length > 0
      ? options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
      : genres.map((g) => (typeof g === 'string' ? { value: g, label: g } : g)),
  );
  let normSelected = $derived(
    (onGenreChange ? selectedGenres : selected) || [],
  );
  /** @param {string[]} v */
  function emit(v) {
    if (onGenreChange) onGenreChange(v);
    else onChange(v);
  }

  let filterText = $state('');
  let visibleOptions = $derived(
    filterText.trim()
      ? normOptions.filter((o) => o.label.toLowerCase().includes(filterText.trim().toLowerCase()))
      : normOptions,
  );

  /** @param {string} value */
  function toggleGenre(value) {
    const isSelected = normSelected.includes(value);
    const updated = isSelected
      ? normSelected.filter((g) => g !== value)
      : [...normSelected, value];
    emit(updated);
  }

  function clearFilters() {
    filterText = '';
    emit([]);
    onOpenChange(false);
  }

  function toggleDropdown() {
    if (!isOpen) filterText = '';
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
    {#if normSelected.length > 0}
      <span class="badge">{normSelected.length}</span>
    {/if}
    <span class="icon" class:open={isOpen}>⌄</span>
  </div>

  {#if isOpen}
    <div class="dropdown" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
      <div class="dropdown-header">
        <span>Selecione {label.toLowerCase()}</span>
        {#if normSelected.length > 0}
          <button onclick={clearFilters} class="clear-btn">Limpar</button>
        {/if}
      </div>

      {#if normOptions.length > 8}
        <div class="dropdown-search">
          <input
            type="text"
            placeholder="Filtrar {label.toLowerCase()}..."
            aria-label="Filtrar {label.toLowerCase()}"
            bind:value={filterText}
          />
        </div>
      {/if}

      <div class="genres-grid">
        {#each visibleOptions as opt (opt.value)}
          <button
            class="genre-tag"
            class:selected={normSelected.includes(opt.value)}
            onclick={() => toggleGenre(opt.value)}
            title={opt.label}
            style="--genre-color: {getGenreColorVar(opt.label)}"
          >
            {opt.label}
          </button>
        {:else}
          <p class="no-options">Nada encontrado para "{filterText}".</p>
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
    padding: 9px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-strong);
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .filter-button:hover {
    border-color: rgba(215, 245, 66, 0.45);
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
    border-radius: var(--radius-pill);
    background: var(--lime);
    color: #101503;
    font-family: var(--font-mono);
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
    background: #0e1422;
    border: 1px solid var(--border-strong);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
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

  .dropdown-search {
    padding: 10px 12px 0;
  }

  .dropdown-search input {
    width: 100%;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: rgba(255, 255, 255, 0.04);
    color: var(--text);
    font-size: 0.82rem;
    outline: none;
  }

  .dropdown-search input::placeholder {
    color: var(--text-muted);
  }

  .dropdown-search input:focus {
    border-color: var(--lime);
  }

  .no-options {
    grid-column: 1 / -1;
    margin: 0;
    padding: 12px 4px;
    color: var(--text-muted);
    font-size: 0.82rem;
    text-align: center;
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
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .genre-tag:hover {
    border-color: rgba(215, 245, 66, 0.5);
    color: var(--lime);
    background: rgba(215, 245, 66, 0.08);
  }

  .genre-tag.selected {
    border-color: var(--lime);
    background: var(--lime);
    color: #101503;
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