<script lang="ts">
  import { Info, Sparkles } from 'lucide-svelte';
  import { wishlist, toggleWishlist, isInWishlist } from './wishlist.js';
  import { onDestroy } from 'svelte';
  import { getGenreColorVar } from './colors.js';
  import { goto } from '$app/navigation';
  import OptimizedImage from './OptimizedImage.svelte';

  let { game, onDetails = () => {} } = $props();
  // track whether this game is in the wishlist by subscribing to the store
  let inList = $state(false);
  const unsubscribe = wishlist.subscribe((list) => {
    inList = isInWishlist(list, game);
  });
  onDestroy(unsubscribe);

  function formatGenres(genres: any[]) {
    return genres?.slice(0, 2).map(g => g.name) || [];
  }

  function handleCardClick() {
    goto(`/game/${game.id}`);
  }
</script>

  <article class="card" class:in-list={inList}>
  <!-- Cover -->
  <div class="cover" onclick={handleCardClick} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }} role="button" tabindex="0">
    {#if game.background_image}
      <OptimizedImage src={game.background_image} alt={game.name} loading="lazy" aspectRatio="3/4" />
    {:else}
      <div class="no-cover">
        <span>{game.name.slice(0, 2).toUpperCase()}</span>
      </div>
    {/if}
    <div class="cover-overlay"></div>

    {#if game.rating}
      <div class="rating-badge">
        <span class="star">★</span>
        <span>{game.rating.toFixed(1)}</span>
      </div>
    {/if}

    {#if game.released}
      <div class="year-badge">{game.released.slice(0, 4)}</div>
    {/if}

    <div class="hover-hint">
      <Sparkles size={20} class="hint-icon" />
      Ver detalhes
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <h3 class="title">{game.name}</h3>

    {#if formatGenres(game.genres).length}
      <div class="genres">
        {#each formatGenres(game.genres) as genre (genre)}
          <span class="genre-badge" style="--gc: {getGenreColorVar(genre)}">{genre}</span>
        {/each}
      </div>
    {/if}

    <div class="actions">
      <button class="btn-details" onclick={handleCardClick}>
        <Info size={16} />
        Detalhes
      </button>
      <button class="btn-wishlist" class:added={inList} onclick={() => toggleWishlist(game)}
        aria-label={inList ? 'Remover da wishlist' : 'Adicionar à wishlist'}>
        <span class="heart-icon" aria-hidden="true">{inList ? '♥' : '♡'}</span>
      </button>
    </div>
  </div>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: all var(--duration-normal) var(--ease-out);
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-6px);
    border-color: var(--border-accent);
    box-shadow: 0 12px 32px rgba(75, 163, 208, 0.15);
    background: var(--surface-hover);
  }

  .card.in-list {
    border-color: var(--success);
    background: linear-gradient(135deg, var(--surface) 0%, rgba(143, 185, 70, 0.08) 100%);
  }

  .card.in-list:hover {
    box-shadow: 0 12px 32px rgba(143, 185, 70, 0.15);
  }

  /* Cover */
  .cover {
    position: relative;
    height: 200px;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(135deg, var(--surface-strong), var(--surface));
  }

  /* The image is now rendered via OptimizedImage component, so the direct
   * .cover img selector is no longer needed. The component handles sizing
   * and hover effects internally. */

  .cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(10, 14, 19, 0.6) 100%);
    pointer-events: none;
  }

  .no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface) 100%);
  }

  .no-cover span {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: rgba(75, 163, 208, 0.1);
    border: 1px solid rgba(102, 192, 244, 0.2);
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--accent-bright);
  }

  /* Badges */
  .rating-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: var(--radius-md);
    background: rgba(10, 14, 19, 0.85);
    border: 1px solid rgba(143, 185, 70, 0.4);
    backdrop-filter: blur(10px);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--success);
  }

  .star {
    color: var(--warning);
    font-size: 0.9rem;
  }

  .year-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 5px 10px;
    border-radius: var(--radius-md);
    background: rgba(10, 14, 19, 0.85);
    border: 1px solid rgba(75, 163, 208, 0.3);
    backdrop-filter: blur(10px);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent-bright);
  }

  .hover-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    background: rgba(75, 163, 208, 0.15);
    color: var(--accent-bright);
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0;
    transition: opacity var(--duration-normal) var(--ease-out);
    backdrop-filter: blur(4px);
  }

  :global(.hint-icon) {
    animation: float 2s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @media (hover: hover) {
    .card:hover .hover-hint {
      opacity: 1;
    }
  }

  /* Content */
  .content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    background: var(--surface);
  }

  .title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
    font-family: "Space Grotesk", sans-serif;
  }

  /* Genres */
  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .genre-badge {
    padding: 4px 10px;
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    font-weight: 600;
    background: rgba(75, 163, 208, 0.12);
    color: var(--accent-bright);
    border: 1px solid rgba(102, 192, 244, 0.2);
    transition: all var(--duration-fast) var(--ease-out);
  }

  .card:hover .genre-badge {
    background: rgba(from var(--gc) r g b / 0.2);
    border-color: rgba(from var(--gc) r g b / 0.5);
  }

  /* Actions */
  .actions {
    display: grid;
    grid-template-columns: 1fr 40px;
    gap: 8px;
    margin-top: auto;
  }

  .btn-details {
    padding: 9px 12px;
    border-radius: var(--radius-sm);
    background: var(--surface-strong);
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-details:hover {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent-bright);
    transform: translateY(-2px);
  }

  .btn-wishlist {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: rgba(75, 163, 208, 0.1);
    border: 1px solid rgba(102, 192, 244, 0.2);
    color: var(--accent-bright);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .heart-icon {
    font-size: 1.15rem;
    line-height: 1;
  }

  .btn-wishlist:hover {
    border-color: var(--accent-bright);
    color: var(--accent-bright);
    background: rgba(75, 163, 208, 0.2);
    transform: scale(1.05);
  }

  .btn-wishlist.added {
    background: rgba(163, 113, 215, 0.18);
    border-color: rgba(163, 113, 215, 0.55);
    color: var(--accent-secondary);
    box-shadow: 0 4px 12px rgba(163, 113, 215, 0.35);
  }

  .btn-wishlist.added:hover {
    background: rgba(163, 113, 215, 0.28);
    border-color: rgba(181, 128, 224, 0.75);
    color: var(--accent-secondary-hover);
    box-shadow: 0 6px 16px rgba(163, 113, 215, 0.45);
  }

  @media (max-width: 640px) {
    .cover {
      height: 170px;
    }

    .content {
      padding: 12px;
      gap: 8px;
    }

    .actions {
      grid-template-columns: 1fr;
    }

    .btn-wishlist {
      width: 100%;
      padding: 9px;
    }
  }
</style>