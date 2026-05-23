<script lang="ts">
  import { Search, Heart, Compass } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { wishlist } from './wishlist.js';
  let { activeTab = 'explore', onTabChange = () => {}, wishlistCount = 0, query = $bindable(''), onSearch = () => {} } = $props();
  let searchFocused = $state(false);

  let displayedWishlistCount = $state(0);

  $effect(() => {
    displayedWishlistCount = wishlistCount || $wishlist.length;
  });

  function handleTabChange(tab: string) {
    // Update URL search param `tab` so the page reacts to it
    const params = new URLSearchParams($page.url.searchParams);
    if (tab && tab !== 'explore') {
      params.set('tab', tab);
    } else {
      params.delete('tab');
    }

    const queryString = params.toString();
    goto(queryString ? `?${queryString}` : '/', { replaceState: true, keepFocus: true });
    // call optional external handler for compatibility
    try { onTabChange(tab); } catch (e) {}
  }

  function handleSearchInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const target = e.target as HTMLInputElement;
    onSearch(target.value);
  }
</script>

<header class="header">
  <div class="header-inner">
    <div class="brand">
      <img src="/logo.png" alt="GameWishlist Logo" class="logo" />
      <div class="brand-text">
        <span class="brand-name">GameWishlist</span>
        <span class="brand-sub">Sua lista de desejos</span>
      </div>
    </div>

    <div class="search-wrap" class:focused={searchFocused}>
      <Search class="search-icon" size={16} />
      <input
        type="text"
        placeholder="Buscar jogos..."
        aria-label="Buscar jogos"
        value={query}
        oninput={handleSearchInput}
        onfocus={() => searchFocused = true}
        onblur={() => searchFocused = false}
      />
    </div>

    <nav class="nav">
      <button class="nav-btn" class:active={activeTab === 'explore'} aria-current={activeTab === 'explore' ? 'page' : undefined} onclick={() => handleTabChange('explore')}>
        <Compass class="nav-icon" size={18} />
        <span class="nav-label">Explorar</span>
      </button>
      <button class="nav-btn" class:active={activeTab === 'wishlist'} aria-current={activeTab === 'wishlist' ? 'page' : undefined} onclick={() => handleTabChange('wishlist')}>
        <Heart class="nav-icon" size={18} />
        <span class="nav-label">Wishlist</span>
        {#if displayedWishlistCount > 0}
          <span class="badge">{displayedWishlistCount}</span>
        {/if}
      </button>
    </nav>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(15, 20, 25, 0.92);
    border-bottom: 1px solid var(--border-strong);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px) saturate(1.4);
  }

  .header-inner {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px clamp(16px, 4vw, 32px);
    max-width: 1440px;
    margin: 0 auto;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    cursor: pointer;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .brand:hover {
    opacity: 0.85;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    object-fit: contain;
    flex-shrink: 0;
    transition: transform var(--duration-fast) var(--ease-out);
    filter: drop-shadow(0 2px 8px rgba(102, 192, 244, 0.3));
  }

  .brand:hover .logo {
    transform: scale(1.08);
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .brand-name {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--text-strong);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .brand-sub {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .search-wrap {
    flex: 1;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border-strong);
    transition: all var(--duration-normal) var(--ease-out);
  }

  .search-wrap:hover {
    border-color: var(--border-accent);
    background: var(--surface-hover);
  }

  .search-wrap.focused {
    border-color: var(--accent-bright);
    background: var(--surface-active);
    box-shadow: 0 0 0 3px rgba(102, 192, 244, 0.12);
  }

  :global(.search-icon) {
    color: var(--text-muted);
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
  }

  .search-wrap.focused :global(.search-icon) {
    color: var(--accent-bright);
    opacity: 1;
  }

  .search-wrap input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.88rem;
    outline: none;
    font-family: inherit;
  }

  .search-wrap input::placeholder {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .nav {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
    position: relative;
    font-family: inherit;
  }

  .nav-btn:hover {
    border-color: var(--border-accent);
    color: var(--text);
    background: var(--surface);
    transform: translateY(-1px);
  }

  .nav-btn.active {
    background: linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 100%);
    border-color: var(--accent-bright);
    color: #ffffff;
    box-shadow: 0 4px 16px rgba(102, 192, 244, 0.25);
  }

  :global(.nav-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-label {
    display: inline;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--warning);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 4px;
    animation: scale-in 0.2s var(--ease-out);
  }

  .nav-btn.active .badge {
    background: rgba(255, 255, 255, 0.3);
  }


  @keyframes scale-in {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  @media (max-width: 900px) {
    .header-inner {
      flex-wrap: wrap;
      gap: 12px;
    }

    .search-wrap {
      max-width: 100%;
      order: 3;
      flex-basis: calc(100% - 120px);
    }
  }

  @media (max-width: 768px) {
    .header-inner {
      gap: 12px;
      padding: 10px clamp(12px, 3vw, 24px);
    }

    .brand-text {
      display: none;
    }

    .logo {
      width: 36px;
      height: 36px;
    }

    .search-wrap {
      max-width: 100%;
      order: 3;
      flex-basis: 100%;
      padding: 8px 14px;
    }

    .nav {
      gap: 4px;
    }

    .nav-btn {
      padding: 8px 14px;
      font-size: 0.82rem;
    }
  }

  @media (max-width: 640px) {
    .nav-btn {
      padding: 8px 12px;
    }
  }

  @media (max-width: 480px) {
    .nav-label {
      display: none;
    }

    .nav-btn {
      padding: 8px 10px;
    }
  }
</style>