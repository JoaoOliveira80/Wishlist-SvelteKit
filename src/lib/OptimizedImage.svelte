<script>
  /** @type {{ src?: string; alt?: string; className?: string; loading?: 'lazy' | 'eager'; aspectRatio?: string | null }} */
  let {
    src = '',
    alt = '',
    className = '',
    loading = 'lazy',
    aspectRatio = null,
  } = $props();

  let loaded = $state(false);
  let error = $state(false);

  function handleLoad() {
    loaded = true;
  }

  function handleError() {
    error = true;
    loaded = true;
  }
</script>

<div class="optimized-image {className}" class:loaded style={aspectRatio ? `aspect-ratio: ${aspectRatio}` : ''}>
  {#if !loaded && !error}
    <div class="placeholder"></div>
  {/if}
  {#if !error}
    <img
      {src}
      {alt}
      {loading}
      class:visible={loaded}
      onload={handleLoad}
      onerror={handleError}
    />
  {/if}
</div>

<style>
  .optimized-image {
    position: relative;
    overflow: hidden;
    background: #131a2e;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      #131a2e 0%,
      #1f2a4a 50%,
      #131a2e 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    filter: blur(12px);
    transform: scale(1.04);
    transition:
      opacity 0.5s var(--ease-out),
      filter 0.6s var(--ease-out),
      transform 0.6s var(--ease-out);
  }

  img.visible {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }

  .optimized-image[style*="aspect-ratio"] {
    aspect-ratio: 16 / 10;
  }

  .optimized-image[style*="aspect-ratio"] img {
    height: 100%;
    object-fit: cover;
  }
</style>
