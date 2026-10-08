<script lang="ts">
  import { Search, Heart, Compass, X } from 'lucide-svelte';
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
    const t = e.target as HTMLInputElement;
    onSearch(t.value);
  }
  function clearSearch() { onSearch(''); }
</script>

<header class="header">
  <div class="header-inner">
    <button class="brand" onclick={() => handleTabChange('explore')} aria-label="GameWish — explorar">
      <span class="brand-mark" aria-hidden="true"><img src="/logo.svg" alt="" width="28" height="28" /></span>
      <span class="brand-text"><span class="brand-name">GAME<em>WISH</em></span><span class="brand-sub">sua coleção viva</span></span>
    </button>
    <div class="search-wrap" class:focused={searchFocused}>
      <Search class="search-icon" size={17} />
      <input type="text" placeholder="Busque por título… ex: Elden Ring" aria-label="Buscar jogos" value={query} oninput={handleSearchInput} onfocus={() => searchFocused = true} onblur={() => searchFocused = false} />
      {#if query}<button class="search-clear" onclick={clearSearch} aria-label="Limpar busca"><X size={14} /></button>{:else}<kbd class="search-kbd">/</kbd>{/if}
    </div>
    <nav class="nav" aria-label="Navegação principal">
      <button class="nav-btn" class:active={activeTab === 'explore'} onclick={() => handleTabChange('explore')}><Compass class="nav-icon" size={17} /><span class="nav-label">Explorar</span></button>
      <button class="nav-btn wishlist-btn" class:active={activeTab === 'wishlist'} onclick={() => handleTabChange('wishlist')}><Heart class="nav-icon" size={17} /><span class="nav-label">Wishlist</span>{#if displayedWishlistCount > 0}<span class="badge">{displayedWishlistCount}</span>{/if}</button>
    </nav>
  </div>
</header>

<style>
  .header { position: sticky; top: 0; z-index: 100; background: rgba(6,8,14,0.78); border-bottom: 1px solid var(--border); backdrop-filter: blur(18px) saturate(1.4); }
  .header-inner { display: flex; align-items: center; gap: 18px; padding: 12px clamp(16px,4vw,32px); max-width: 1440px; margin: 0 auto; }
  .brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; background: none; border: none; cursor: pointer; color: inherit; padding: 2px 4px 2px 0; }
  .brand-mark { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #0d1203; background: linear-gradient(135deg,var(--lime-soft),var(--lime) 60%,#a8d61f); box-shadow: var(--shadow-lime); transform: rotate(-4deg); transition: transform .25s var(--ease-spring); overflow: hidden; padding: 3px; }
  .brand-mark img { width: 100%; height: 100%; border-radius: 11px; display: block; }
  .brand:hover .brand-mark { transform: rotate(4deg) scale(1.05); }
  .brand-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; text-align: left; }
  .brand-name { font-family: var(--font-display); font-weight: 800; font-size: 1rem; letter-spacing: .04em; color: var(--text-strong); }
  .brand-name em { font-style: normal; color: var(--lime); }
  .brand-sub { font-size: .66rem; letter-spacing: .18em; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }

  .search-wrap { flex: 1; max-width: 560px; margin-inline: auto; display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 14px; border-radius: var(--radius-pill); background: rgba(255,255,255,0.05); border: 1px solid var(--border-strong); transition: all var(--duration-normal) var(--ease-out); }
  .search-wrap.focused { background: rgba(255,255,255,0.08); border-color: var(--lime); box-shadow: 0 0 0 4px rgba(215,245,66,0.12); }
  :global(.search-icon) { color: var(--text-muted); flex-shrink: 0; }
  .search-wrap.focused :global(.search-icon) { color: var(--lime); }
  .search-wrap input { flex: 1; border: none; background: transparent; color: var(--text); font-size: .9rem; outline: none; font-family: inherit; min-width: 0; }
  .search-wrap input::placeholder { color: var(--text-muted); }
  .search-kbd { font-family: var(--font-mono); font-size: .72rem; font-weight: 700; color: var(--text-muted); border: 1px solid var(--border-strong); border-bottom-width: 2px; border-radius: 6px; padding: 2px 7px; background: rgba(255,255,255,.04); }
  .search-clear { border: 1px solid var(--border-strong); background: rgba(255,255,255,.06); color: var(--text-soft); border-radius: 999px; width: 24px; height: 24px; display: grid; place-items: center; cursor: pointer; }
  .search-clear:hover { color: #0d1203; background: var(--lime); border-color: var(--lime); }

  .nav { display: flex; gap: 8px; flex-shrink: 0; }
  .nav-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-pill); border: 1px solid var(--border-strong); background: rgba(255,255,255,.04); color: var(--text-soft); font-size: .85rem; font-weight: 700; cursor: pointer; transition: all var(--duration-normal) var(--ease-out); font-family: inherit; }
  .nav-btn:hover { border-color: var(--lime); color: var(--text-strong); transform: translateY(-1px); }
  .nav-btn.active { background: var(--lime); border-color: var(--lime); color: #101503; box-shadow: var(--shadow-lime); }
  .wishlist-btn.active :global(.nav-icon) { fill: currentColor; }
  :global(.nav-icon) { display: flex; align-items: center; }
  .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; padding: 0 7px; border-radius: 999px; background: #101503; color: var(--lime); font-size: .72rem; font-weight: 800; font-family: var(--font-mono); }
  .nav-btn:not(.active) .badge { background: var(--lime); color: #101503; }

  @media (max-width: 900px) { .header-inner { flex-wrap: wrap; gap: 12px; } .search-wrap { max-width: 100%; order: 3; flex-basis: 100%; } }
  @media (max-width: 640px) { .brand-sub { display: none; } .brand-mark { width: 38px; height: 38px; border-radius: 12px; } .nav-btn { padding: 9px 14px; font-size: .8rem; } .search-kbd { display: none; } }
  @media (max-width: 480px) { .nav-label { display: none; } .nav-btn { padding: 9px 12px; } }
</style>