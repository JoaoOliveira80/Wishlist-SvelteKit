<script>
  import '../app.css';
  import Header from '../lib/Header.svelte';
  import Footer from '../lib/Footer.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  let { children } = $props();
</script>

<div class="app-shell">
  <a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>
  <Header />
  {#key $page.url.pathname}
    <main id="main-content" class="main-content" tabindex="-1" in:fade={{ duration: 160 }}>
      {@render children()}
    </main>
  {/key}
  <Footer />
</div>

<style>
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    outline: none;
    width: min(1440px, 100% - 32px);
    margin: 0 auto;
    padding: 20px 0 48px;
  }

  .skip-link {
    position: absolute;
    top: -100%;
    left: 16px;
    z-index: 999;
    padding: 12px 20px;
    background: var(--lime);
    color: #101503;
    font-weight: 800;
    font-size: 0.88rem;
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: top 0.2s ease-out;
  }

  .skip-link:focus {
    top: 16px;
  }
  @media (max-width: 640px) {
    .main-content { width: min(100% - 24px, 100%); padding: 14px 0 36px; }
  }
</style>
