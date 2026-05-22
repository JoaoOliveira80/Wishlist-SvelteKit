<script>
  let { count = 12 } = $props();
</script>

<div class="skeleton-grid">
  {#each Array(count) as _, i}
    <div class="skeleton-card" style="animation-delay: {i * 0.05}s">
      <div class="skeleton-cover"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-genres">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge short"></div>
        </div>
        <div class="skeleton-actions">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn small"></div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
  }

  .skeleton-card {
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    animation: fade-in 0.3s var(--ease-out) both;
  }

  .skeleton-cover {
    height: 200px;
    background: linear-gradient(
      90deg,
      var(--surface-strong) 0%,
      var(--surface-hover) 50%,
      var(--surface-strong) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .skeleton-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skeleton-title {
    height: 16px;
    width: 85%;
    border-radius: var(--radius-xs);
    background: linear-gradient(
      90deg,
      var(--surface-strong) 0%,
      var(--surface-hover) 50%,
      var(--surface-strong) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .skeleton-genres {
    display: flex;
    gap: 5px;
  }

  .skeleton-badge {
    height: 22px;
    width: 60px;
    border-radius: var(--radius-xs);
    background: linear-gradient(
      90deg,
      var(--surface-strong) 0%,
      var(--surface-hover) 50%,
      var(--surface-strong) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .skeleton-badge.short {
    width: 40px;
  }

  .skeleton-actions {
    display: grid;
    grid-template-columns: 1fr 40px;
    gap: 8px;
    margin-top: auto;
  }

  .skeleton-btn {
    height: 36px;
    border-radius: var(--radius-sm);
    background: linear-gradient(
      90deg,
      var(--surface-strong) 0%,
      var(--surface-hover) 50%,
      var(--surface-strong) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }

  .skeleton-btn.small {
    width: 40px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1200px) {
    .skeleton-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
  }

  @media (max-width: 900px) {
    .skeleton-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
  }

  @media (max-width: 640px) {
    .skeleton-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .skeleton-cover {
      height: 170px;
    }

    .skeleton-content {
      padding: 12px;
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .skeleton-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
