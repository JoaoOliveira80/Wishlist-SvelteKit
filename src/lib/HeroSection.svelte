<script lang="ts">
  import { Telescope, Package, Heart, Star } from 'lucide-svelte';
  // import StatCard from './StatCard.svelte';

  type FeaturedGame = {
    background_image?: string;
  } | null;

  interface Props {
    featuredGame?: FeaturedGame;
    gamesCount?: number;
    wishlistCount?: number;
    avgRating?: number;
    onExplore?: () => void;
  }

  let {
    featuredGame = null,
    gamesCount = 0,
    wishlistCount = 0,
    avgRating = 0,
    onExplore = () => {}
  }: Props = $props();
</script>

<section class="hero">
  {#if featuredGame?.background_image}
    <div class="hero-bg">
      <img src={featuredGame.background_image} alt="" aria-hidden="true" />
      <div class="hero-bg-overlay"></div>
    </div>
  {:else}
    <div class="hero-bg-fallback"></div>
  {/if}

  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-eyebrow">
        <span class="eyebrow-dot">●</span>
        Powered by RAWG Database
      </div>
      <h2 class="hero-title">Sua wishlist de games</h2>
      <p class="hero-desc">Explore milhares de títulos, descubra lançamentos e salve os seus favoritos em uma biblioteca pessoal.</p>
      <div class="hero-actions">
        <button class="btn-primary" onclick={onExplore}>
          <Telescope size={20} />
          Explorar Catálogo
        </button>
      </div>
    </div>

    <!-- <div class="hero-right">
      <div class="stats-grid">
        <StatCard
          label="Catálogo"
          value={gamesCount}
          icon={Package}
          color="var(--accent-bright)"
          animate={true}
        />
        <StatCard
          label="Guardados"
          value={wishlistCount}
          icon={Heart}
          color="var(--success)"
          animate={true}
        />
        <StatCard
          label="Avaliação Média"
          value={avgRating}
          icon={Star}
          color="var(--warning)"
          animate={true}
        />
      </div>
    </div> -->
  </div>
</section>

<style>
  .hero {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-strong);
    margin-bottom: 32px;
    min-height: 320px;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .hero-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.25) saturate(1.2) blur(3px);
  }

  .hero-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      rgba(10, 14, 19, 0.97) 0%,
      rgba(10, 14, 19, 0.85) 35%,
      rgba(26, 35, 50, 0.6) 100%
    );
    backdrop-filter: blur(2px);
  }

  .hero-bg-fallback {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--surface-strong) 0%, var(--surface) 100%);
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    padding: clamp(36px, 5vw, 56px) clamp(32px, 5vw, 56px);
    min-height: 280px;
  }

  .hero-left {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 580px;
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent-bright);
    opacity: 0.9;
    width: fit-content;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    background: rgba(102, 192, 244, 0.1);
    border: 1px solid rgba(102, 192, 244, 0.15);
  }

  .eyebrow-dot {
    font-size: 0.5rem;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .hero-title {
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text-strong);
    margin: 0;
    background: linear-gradient(135deg, var(--text-strong) 0%, var(--accent-bright) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-desc {
    font-size: 1.05rem;
    color: var(--text-soft);
    line-height: 1.7;
    max-width: 52ch;
    margin: 0;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 4px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 100%);
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    border: none;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
    box-shadow: 0 8px 20px rgba(75, 163, 208, 0.35);
    position: relative;
    overflow: hidden;
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform var(--duration-smooth) var(--ease-out);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(75, 163, 208, 0.45);
  }

  .btn-primary:hover::before {
    transform: translateX(100%);
  }

  :global(.btn-primary svg) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* The right side and stats grid are currently not rendered (commented out in markup).
   * Removing these unused selectors eliminates Vite warnings and reduces CSS size.
   */

  @media (max-width: 900px) {
    .hero-inner {
      flex-direction: column;
      gap: 32px;
      min-height: auto;
    }

    .hero-left {
      max-width: 100%;
    }
    /* .hero-right and .stats-grid are not used; removed their styles */
  }

  @media (max-width: 768px) {
    .hero {
      min-height: 280px;
      border-radius: var(--radius-lg);
    }

    .hero-inner {
      padding: 32px 24px;
      gap: 28px;
    }

    .hero-title {
      font-size: clamp(2rem, 6vw, 2.8rem);
    }

    .hero-desc {
      font-size: 1rem;
      max-width: 100%;
    }
    /* .stats-grid removed */
  }

  @media (max-width: 640px) {
    .hero-inner {
      padding: 24px 20px;
      gap: 24px;
    }

    .hero-title {
      font-size: clamp(1.8rem, 7vw, 2.4rem);
    }

    .hero-desc {
      font-size: 0.92rem;
    }

    .btn-primary {
      padding: 12px 24px;
      font-size: 0.9rem;
    }
    /* .stats-grid removed */
  }

  @media (max-width: 480px) {
    .hero {
      min-height: 240px;
    }

    .hero-inner {
      padding: 20px 16px;
    }
    /* .stats-grid removed */
  }
</style>