<script>
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
    background: var(--surface-strong);
  }

  .placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--surface-strong) 0%,
      var(--surface-hover) 50%,
      var(--surface-strong) 100%
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
    height: auto;
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }

  img.visible {
    opacity: 1;
  }

  .optimized-image[style*="aspect-ratio"] img {
    height: 100%;
    object-fit: cover;
  }

  img.visible {
    opacity: 1;
  }
</style>
