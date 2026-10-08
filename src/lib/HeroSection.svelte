<script lang="ts">
  import { Telescope, Heart, Star, Package, ArrowDown, Gamepad2 } from 'lucide-svelte';

  type FeaturedGame = {
    background_image?: string;
    name?: string;
    rating?: number;
  } | null;

  interface Props {
    featuredGame?: FeaturedGame;
    gamesCount?: number;
    wishlistCount?: number;
    avgRating?: number;
    onExplore?: () => void;
    onWishlist?: () => void;
  }

  let {
    featuredGame = null,
    gamesCount = 0,
    wishlistCount = 0,
    avgRating = 0,
    onExplore = () => {},
    onWishlist = () => {}
  }: Props = $props();

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')} mil` : `${n}`;
  const marqueeItems = ['RPG', 'Souls-like', 'Indie', 'Co-op', 'Mundo aberto', 'Pixel art', 'Aventura', 'Estratégia'];

  function scrollToCatalog() {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function handleExplore() {
    onExplore();
    scrollToCatalog();
  }
</script>

<section class="hero" aria-labelledby="hero-title">
  <div class="hero-grid-bg" aria-hidden="true"></div>
  {#if featuredGame?.background_image}
    <div class="hero-art" aria-hidden="true">
      <img src={featuredGame.background_image} alt="" loading="eager" fetchpriority="high" />
      <div class="hero-art-frame"></div>
    </div>
  {/if}

  <div class="hero-inner">
    <div class="hero-left">
      <p class="hero-eyebrow">
        <span class="eyebrow-pulse" aria-hidden="true"></span>
        Powered by RAWG · +{fmt(gamesCount)} jogos no catálogo
      </p>
      <h1 id="hero-title" class="hero-title">
        Sua próxima<br />obsessão <span class="title-lime">gamer</span><br />começa aqui.
      </h1>
      <p class="hero-desc">
        Explore milhares de títulos, filtre por gênero e plataforma, e guarde
        seus favoritos numa wishlist que vive no seu navegador.
      </p>
      <div class="hero-actions">
        <button class="btn-lime" onclick={handleExplore}>
          <Telescope size={18} aria-hidden="true" />
          Explorar catálogo
        </button>
        <button class="btn-ghost" onclick={onWishlist}>
          <Heart size={18} aria-hidden="true" />
          Ver wishlist{#if wishlistCount > 0}&nbsp;({wishlistCount}){/if}
        </button>
      </div>
      <dl class="hero-stats" aria-label="Resumo da coleção">
        <div class="stat">
          <dt><Package size={14} aria-hidden="true" /> Catálogo</dt>
          <dd>{fmt(gamesCount)}</dd>
        </div>
        <div class="stat">
          <dt><Heart size={14} aria-hidden="true" /> Guardados</dt>
          <dd>{wishlistCount}</dd>
        </div>
        <div class="stat">
          <dt><Star size={14} aria-hidden="true" /> Nota média</dt>
          <dd>{avgRating ? avgRating.toFixed(1).replace('.', ',') : '—'}</dd>
        </div>
      </dl>
    </div>

    <aside class="hero-right" aria-label="Destaque do catálogo">
      {#if featuredGame?.background_image}
        <figure class="spot-card">
          <img src={featuredGame.background_image} alt={featuredGame?.name ? `Arte do jogo ${featuredGame.name}` : 'Arte do jogo em destaque'} loading="lazy" />
          <span class="spot-tag"><Gamepad2 size={13} aria-hidden="true" /> Destaque RAWG</span>
          {#if featuredGame?.name}
            <figcaption class="spot-cap">
              <strong>{featuredGame.name}</strong>
              {#if featuredGame.rating}<span>★ {featuredGame.rating}</span>{/if}
            </figcaption>
          {/if}
        </figure>
      {:else}
        <div class="spot-fallback" aria-hidden="true">
          <span class="spot-fallback-mark">GAMEWISH</span>
          <span class="spot-fallback-sub">void · arcade · lime</span>
        </div>
      {/if}
      <a class="scroll-hint" href="#catalogo" aria-label="Rolar para o catálogo">
        <ArrowDown size={15} aria-hidden="true" /> role para explorar
      </a>
    </aside>
  </div>

  <div class="hero-marquee" aria-hidden="true">
    <div class="marquee-track">
      {#each [...marqueeItems, ...marqueeItems] as tag, i}
        <span class="marquee-chip">{tag}{i < marqueeItems.length * 2 - 1 ? ' ✦' : ''}</span>
      {/each}
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-strong);
    margin-bottom: 28px;
    background: var(--surface);
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--lime);
    z-index: 3;
  }
  .hero-grid-bg {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: radial-gradient(720px 340px at 18% 0%, black 25%, transparent 75%);
  }
  .hero-art { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .hero-art img {
    width: 100%; height: 100%; object-fit: cover;
    opacity: 0.16; filter: saturate(1.1);
  }
  .hero-art-frame {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(6,8,14,0.97) 30%, rgba(6,8,14,0.82) 55%, rgba(6,8,14,0.45) 100%);
  }
  .hero-inner {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1.25fr 0.85fr;
    gap: clamp(28px, 4vw, 56px); align-items: center;
    padding: clamp(32px, 4.5vw, 52px) clamp(24px, 4vw, 48px) clamp(24px, 3vw, 32px);
  }
  .hero-left { display: flex; flex-direction: column; gap: 18px; max-width: 620px; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    width: fit-content; padding: 8px 14px;
    font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: var(--lime);
    border: 1px solid var(--border-accent); border-radius: var(--radius-pill);
    background: rgba(215,245,66,0.07);
  }
  .eyebrow-pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--lime); box-shadow: 0 0 0 4px rgba(215,245,66,0.18);
    animation: pulse-dot 2s ease-in-out infinite;
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(2.1rem, 4.6vw, 3.6rem);
    font-weight: 800; line-height: 1.04; letter-spacing: -0.02em;
    color: var(--text-strong); margin: 0;
    text-wrap: balance;
  }
  .title-lime {
    display: inline-block; padding: 0 14px; border-radius: 14px;
    background: var(--lime); color: #101503;
    transform: rotate(-1.5deg);
  }
  .hero-desc {
    font-size: 1.02rem; color: var(--text-soft); line-height: 1.65;
    max-width: 52ch; margin: 0;
  }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2px; }
  .btn-lime {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 13px 24px; border-radius: var(--radius-pill);
    background: var(--lime); border: 1px solid var(--lime);
    color: #101503; font-size: 0.92rem; font-weight: 800;
    cursor: pointer; transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal);
    box-shadow: var(--shadow-lime);
  }
  .btn-lime:hover { transform: translateY(-2px); box-shadow: 0 12px 34px rgba(215,245,66,0.32); }
  .btn-lime:active { transform: translateY(0); }
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 13px 22px; border-radius: var(--radius-pill);
    background: transparent; border: 1px solid var(--border-strong);
    color: var(--text); font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: border-color var(--duration-normal), color var(--duration-normal), transform var(--duration-normal);
  }
  .btn-ghost:hover { border-color: var(--lime); color: var(--lime); transform: translateY(-2px); }
  .hero-stats {
    display: flex; gap: 0; margin: 8px 0 0;
    border: 1px solid var(--border); border-radius: var(--radius-md);
    background: rgba(255,255,255,0.02); overflow: hidden; max-width: 560px;
  }
  .stat { flex: 1; padding: 12px 16px; }
  .stat + .stat { border-left: 1px solid var(--border); }
  .stat dt {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 4px;
  }
  .stat dd { margin: 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text-strong); }
  .hero-right { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
  .spot-card {
    position: relative; margin: 0; overflow: hidden;
    border: 1px solid var(--border-strong); border-radius: var(--radius-lg);
    background: #0a0e18; transform: rotate(1.5deg);
    transition: transform var(--duration-normal) var(--ease-out);
  }
  .spot-card:hover { transform: rotate(0deg) translateY(-3px); }
  .spot-card img { width: 100%; height: 300px; object-fit: cover; }
  .spot-tag {
    position: absolute; top: 12px; left: 12px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--radius-pill);
    background: rgba(6,8,14,0.82); border: 1px solid var(--border-accent);
    color: var(--lime); font-family: var(--font-mono);
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
  }
  .spot-cap {
    position: absolute; left: 12px; right: 12px; bottom: 12px;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 14px; border-radius: var(--radius-md);
    background: rgba(6,8,14,0.85); border: 1px solid var(--border);
    color: var(--text-strong); font-size: 0.85rem;
  }
  .spot-cap span { color: var(--lime); font-family: var(--font-mono); font-weight: 700; white-space: nowrap; }
  .spot-fallback {
    display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;
    gap: 6px; height: 300px; padding: 20px;
    border: 1px dashed var(--border-strong); border-radius: var(--radius-lg);
    background: rgba(255,255,255,0.02); transform: rotate(1.5deg);
  }
  .spot-fallback-mark { font-family: var(--font-display); font-weight: 800; font-size: 1.6rem; color: var(--text-strong); }
  .spot-fallback-sub { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--lime); }
  .scroll-hint {
    display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
    font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-muted); text-decoration: none; padding: 4px 2px;
  }
  .scroll-hint:hover { color: var(--lime); }
  .hero-marquee {
    position: relative; z-index: 1;
    border-top: 1px solid var(--border);
    overflow: hidden; padding: 12px 0;
    font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted);
    background: rgba(0,0,0,0.25);
  }
  .marquee-track { display: inline-flex; gap: 28px; padding-left: 24px; white-space: nowrap; animation: marquee 26s linear infinite; }
  .marquee-chip:nth-child(odd) { color: var(--lime); }

  @media (max-width: 1020px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-right { max-width: 560px; }
    .spot-card img, .spot-fallback { height: 240px; }
  }
  @media (max-width: 640px) {
    .hero { border-radius: var(--radius-lg); }
    .hero-inner { padding: 28px 20px 20px; gap: 24px; }
    .hero-title { font-size: clamp(1.9rem, 8vw, 2.5rem); }
    .hero-desc { font-size: 0.95rem; }
    .hero-actions .btn-lime, .hero-actions .btn-ghost { flex: 1; justify-content: center; }
    .hero-stats { flex-direction: column; }
    .stat + .stat { border-left: none; border-top: 1px solid var(--border); }
    .hero-marquee { font-size: 0.7rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-track, .eyebrow-pulse { animation: none; }
  }
</style>