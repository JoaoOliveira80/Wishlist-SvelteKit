<script>
  /**
   * @typedef {{
   *   label: string;
   *   value: string | number;
   *   icon?: any;
   *   color?: string;
   *   animate?: boolean;
   * }} StatCardProps
   */

  let { label = '', value = 0, icon = null, color = 'var(--accent-bright)', animate = false } = $props();
</script>

<div class="stat-card" class:animate={animate} style="--card-color: {color}">
  {#if icon}
    {@const Icon = icon}
    <div class="stat-icon">
      <Icon size={24} />
    </div>
  {/if}
  <div class="stat-content">
    <span class="stat-label">{label}</span>
    <strong class="stat-value">{value}</strong>
  </div>
</div>

<style>
  .stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
    transition: all var(--duration-normal) var(--ease-in-out);
  }

  .stat-card.animate {
    animation: float-in var(--duration-smooth) var(--ease-out) both;
  }

  .stat-card:hover {
    border-color: var(--card-color);
    background: var(--surface-hover);
    box-shadow: 0 8px 24px rgba(75, 163, 208, 0.15);
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--card-color), var(--card-color));
    color: white;
  }

  :global(.stat-icon svg) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    color: var(--text-muted);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-value {
    color: var(--text);
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.6rem;
    letter-spacing: -0.02em;
  }

  @media (max-width: 640px) {
    .stat-card {
      padding: 14px 16px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1.4rem;
    }

    .stat-value {
      font-size: 1.3rem;
    }
  }
</style>