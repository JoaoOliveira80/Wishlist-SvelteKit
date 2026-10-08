<script lang="ts">
  import { wishlist, toggleWishlist, isInWishlist } from './wishlist.js';
  import { onDestroy } from 'svelte';
  import { getGenreColor, getGenreColorVar } from './colors.js';
  import { goto } from '$app/navigation';
  import OptimizedImage from './OptimizedImage.svelte';

  let { game, rank = null as number | null, onDetails = () => {} } = $props();
  // track whether this game is in the wishlist by subscribing to the store
  let inList = $state(false);
  const unsubscribe = wishlist.subscribe((list) => {
    inList = isInWishlist(list, game);
  });
  onDestroy(unsubscribe);

  let tiltX = $state(0);
  let tiltY = $state(0);
  let tilting = $state(false);
  let reduceMotion = $state(false);

  $effect(() => {
    if (typeof window !== 'undefined' && typeof matchMedia !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduceMotion = mq.matches;
      const onChange = (e: MediaQueryListEvent) => (reduceMotion = e.matches);
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    }
  });

  function formatGenres(genres: any[]) {
    return genres?.slice(0, 2).map(g => g.name) || [];
  }

  function metaClass(m?: number | null) {
    if (m == null) return '';
    if (m >= 75) return 'meta-high';
    if (m >= 50) return 'meta-mid';
    return 'meta-low';
  }

  function platformShort(name: string) {
    const n = (name || '').toLowerCase();
    if (n.includes('pc')) return 'PC';
    if (n.includes('playstation') || n.includes('ps5') || n.includes('ps4') || n === 'ps') return 'PS';
    if (n.includes('xbox')) return 'XBOX';
    if (n.includes('nintendo') || n.includes('switch')) return 'SWITCH';
    if (n.includes('mac')) return 'MAC';
    if (n.includes('linux')) return 'LINUX';
    if (n.includes('android')) return 'DROID';
    if (n.includes('ios')) return 'iOS';
    return name.slice(0, 6).toUpperCase();
  }

  function platformList(): string[] {
    const raw: any[] = game.platforms || game.parent_platforms || [];
    const names = raw.map((p) => p?.platform?.name || p?.name || '').filter(Boolean);
    return Array.from(new Set(names.map(platformShort))).slice(0, 4);
  }

  function tiltStyle() {
    if (!tilting || reduceMotion) return '';
    return `transform: perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px);`;
  }

  function handleTilt(e: MouseEvent) {
    if (reduceMotion) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY = Math.max(-4, Math.min(4, px * 8));
    tiltX = Math.max(-4, Math.min(4, -py * 8));
    tilting = true;
  }

  function resetTilt() {
    tiltX = 0;
    tiltY = 0;
    tilting = false;
  }

  function handleCardClick() {
    goto(`/game/${game.id}`);
  }

  function handleWish(e: MouseEvent) {
    e.stopPropagation();
    toggleWishlist(game);
  }

  let rankLabel = $derived(rank != null ? `#${String(rank).padStart(3, '0')}` : null);
  let year = $derived(game.released ? String(game.released).slice(0, 4) : null);

  // Cor de acento derivada do gênero principal — dá identidade única a cada card
  let accent = $derived(getGenreColor(game.genres?.[0]?.name));
  let accentVar = $derived(getGenreColorVar(game.genres?.[0]?.name));

  function cardStyle() {
    const parts = [tiltStyle(), `--gc: ${accent};`].filter(Boolean);
    return parts.join(' ');
  }
</script>

  <article class="card" class:in-list={inList} style={cardStyle()} onmousemove={handleTilt} onmouseleave={resetTilt}>
  <!-- Cover -->
  <div class="cover" onclick={handleCardClick} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }} role="button" tabindex="0" aria-label={`Ver ${game.name}`}>
    {#if game.background_image}
      <OptimizedImage src={game.background_image} alt={game.name} loading="lazy" aspectRatio="16/10" />
    {:else}
      <div class="no-cover">
        <span>{game.name.slice(0, 2).toUpperCase()}</span>
      </div>
    {/if}
    <div class="cover-overlay"></div>
    <div class="scanline" aria-hidden="true"></div>

    {#if rankLabel}
      <div class="rank-chip" title="Posição na lista">{rankLabel}</div>
    {/if}

    {#if game.metacritic != null}
      <div class="meta-chip {metaClass(game.metacritic)}" title="Metacritic {game.metacritic}">M {game.metacritic}</div>
    {/if}

    <div class="play-overlay" aria-hidden="true">
      <span class="play-btn">▶ FICHA</span>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    {#if platformList().length}
      <div class="platforms" aria-label="Plataformas">
        {#each platformList() as p (p)}
          <span class="plat">{p}</span>
        {/each}
      </div>
    {/if}

    <h3 class="title">{game.name}</h3>

    {#if formatGenres(game.genres).length}
      <div class="genres">
        {#each formatGenres(game.genres) as genre (genre)}
          <span class="genre-badge" style="--gc: {getGenreColorVar(genre)}">{genre}</span>
        {/each}
      </div>
    {/if}

    <div class="foot">
      <span class="foot-stat">
        {#if game.rating}<span class="star" aria-hidden="true">★</span> {Number(game.rating).toFixed(1)}{/if}
        {#if year}<span class="dot" aria-hidden="true">•</span> {year}{/if}
      </span>
      <span class="foot-actions">
        <button class="btn-wishlist" class:added={inList} onclick={handleWish}
          aria-label={inList ? 'Remover da wishlist' : 'Adicionar à wishlist'}
          title={inList ? 'Na wishlist — clique para remover' : 'Adicionar à wishlist'}>
          <span class="heart-icon" aria-hidden="true">{inList ? '♥' : '♡'}</span>
          <span class="tip">{inList ? 'NA LISTA!' : '+ WISHLIST'}</span>
        </button>
      </span>
    </div>
  </div>
</article>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
    will-change: transform;
    cursor: pointer;
  }

  /* Barra de acento no topo, colorida pelo gênero principal */
  .card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gc, var(--violet)), transparent 85%);
    opacity: 0.55;
    z-index: 4;
    transition: opacity var(--duration-normal) var(--ease-out);
  }

  /* Glow de acento suave no canto, reforça a identidade do gênero */
  .card::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: var(--gc, var(--violet));
    opacity: 0;
    filter: blur(50px);
    pointer-events: none;
    transition: opacity var(--duration-normal) var(--ease-out);
  }

  .card:hover {
    border-color: color-mix(in srgb, var(--gc, var(--lime)) 55%, transparent);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.55),
      0 0 0 1px color-mix(in srgb, var(--gc, var(--lime)) 22%, transparent),
      0 8px 40px -12px color-mix(in srgb, var(--gc, var(--lime)) 45%, transparent);
    background: var(--surface);
  }

  .card:hover::before {
    opacity: 1;
  }

  .card:hover::after {
    opacity: 0.16;
  }

  .card.in-list {
    border-color: var(--lime);
    box-shadow: 0 0 0 1px rgba(215, 245, 66, 0.4), 0 8px 30px rgba(215, 245, 66, 0.12);
  }

  .card.in-list:hover {
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.5),
      0 0 0 1px var(--lime),
      0 8px 40px -10px rgba(215, 245, 66, 0.35);
  }

  /* Cover */
  .cover {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    cursor: pointer;
    background: #0e1422;
  }

  /* The image is now rendered via OptimizedImage component, so the direct
   * .cover img selector is no longer needed. The component handles sizing
   * and hover effects internally. */

  :global(.cover .optimized-image img) {
    transition:
      opacity 0.5s var(--ease-out),
      transform 0.6s var(--ease-out),
      filter 0.6s var(--ease-out);
  }

  .card:hover :global(.cover .optimized-image img.visible) {
    transform: scale(1.08);
    filter: saturate(1.15) contrast(1.05);
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(6, 8, 14, 0.08) 30%, rgba(4, 6, 11, 0.78) 100%);
    pointer-events: none;
    transition: opacity var(--duration-normal) var(--ease-out);
  }

  .scanline {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.5;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.05) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: overlay;
  }

  .no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0e1422;
  }

  .no-cover span {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: rgba(215, 245, 66, 0.08);
    border: 1px solid rgba(215, 245, 66, 0.25);
    font-family: var(--font-head);
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--lime);
  }

  /* Rank + metacritic */
  .rank-chip {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 5px 9px;
    border-radius: var(--radius-xs);
    background: rgba(6, 8, 14, 0.85);
    border: 1px solid rgba(215, 245, 66, 0.5);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--lime);
  }

  .meta-chip {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 9px;
    border-radius: var(--radius-xs);
    background: rgba(6, 8, 14, 0.85);
    border: 1px solid var(--border-strong);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .meta-high {
    color: var(--lime);
    border-color: rgba(215, 245, 66, 0.55);
    box-shadow: 0 0 0 1px rgba(215, 245, 66, 0.12);
  }

  .meta-mid {
    color: var(--gold);
    border-color: rgba(255, 178, 36, 0.5);
  }

  .meta-low {
    color: var(--pink);
    border-color: rgba(255, 106, 168, 0.5);
  }

  /* Legacy badge hooks kept for compat */
  .rating-badge,
  .year-badge,
  .hover-hint,
  :global(.hint-icon) {
    display: none;
  }

  @keyframes heart-pop {
    0% { transform: scale(0.6); }
    55% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }

  /* Play overlay */
  .play-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    transition:
      opacity var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
    pointer-events: none;
    background: radial-gradient(320px 160px at 50% 55%, rgba(215, 245, 66, 0.18), transparent 70%);
  }

  .card:hover .play-overlay,
  .card:focus-within .play-overlay {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .play-btn {
    padding: 10px 16px;
    border-radius: var(--radius-pill);
    background: var(--lime);
    color: #101503;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    box-shadow: var(--shadow-lime);
  }

  /* Content */
  .content {
    padding: 14px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    background: var(--surface);
  }

  .title {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
    font-family: var(--font-head);
  }

  /* Platforms */
  .platforms {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .plat {
    padding: 3px 8px;
    border-radius: var(--radius-xs);
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    color: var(--violet);
    font-family: var(--font-mono);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  /* Genres */
  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .genre-badge {
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--gc, var(--lime)) 10%, transparent);
    color: var(--gc, var(--lime));
    border: 1px solid color-mix(in srgb, var(--gc, var(--lime)) 26%, transparent);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out);
  }

  .card:hover .genre-badge {
    border-color: color-mix(in srgb, var(--gc, var(--lime)) 50%, transparent);
    background: color-mix(in srgb, var(--gc, var(--lime)) 16%, transparent);
  }

  /* Footer */
  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .foot-stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--text-soft);
    min-width: 0;
  }

  .foot-stat .star {
    color: var(--lime);
    font-size: 0.85rem;
  }

  .foot-stat .dot {
    color: var(--text-muted);
  }

  .foot-actions {
    display: inline-flex;
    align-items: center;
  }

  .btn-wishlist {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border-radius: var(--radius-sm);
    background: rgba(215, 245, 66, 0.06);
    border: 1px solid rgba(215, 245, 66, 0.25);
    color: var(--lime);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition:
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }

  .heart-icon {
    font-size: 1rem;
    line-height: 1;
    display: inline-block;
  }

  .tip {
    white-space: nowrap;
  }

  .btn-wishlist:hover {
    border-color: var(--lime);
    background: rgba(215, 245, 66, 0.14);
    transform: translateY(-1px);
  }

  .btn-wishlist:hover .tip,
  .btn-wishlist:focus-visible .tip {
    opacity: 1;
    transform: translateY(0);
  }

  .btn-wishlist.added {
    background: var(--lime);
    border-color: var(--lime);
    color: #101503;
    box-shadow: var(--shadow-lime);
  }

  .btn-wishlist.added .heart-icon {
    animation: heart-pop 0.35s var(--ease-spring);
  }

  .btn-wishlist.added:hover {
    background: var(--lime-soft);
    border-color: var(--lime-soft);
    color: #101503;
  }

  @media (max-width: 640px) {
    .content {
      padding: 12px;
      gap: 8px;
    }

    .foot {
      flex-wrap: wrap;
    }

    .btn-wishlist {
      padding: 9px 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    .card:hover {
      transform: none !important;
    }

    .play-overlay {
      opacity: 0;
    }

    .card:focus-within .play-overlay {
      opacity: 1;
      transform: none;
    }
  }
</style>