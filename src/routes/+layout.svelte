<script>
  import '../app.css';
  import Header from '../lib/Header.svelte';
  import Footer from '../lib/Footer.svelte';
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  let { children } = $props();
</script>

<div class="app-shell">
  <a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>
  <Header />
  {#key $page.url.pathname}
    <main id="main-content" class="main-content" tabindex="-1" in:fly={{ x: 20, duration: 200, delay: 200 }} out:fly={{ x: -20, duration: 200 }}>
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
  }

  .skip-link {
    position: absolute;
    top: -100%;
    left: 16px;
    z-index: 999;
    padding: 12px 20px;
    background: var(--accent-bright);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: top 0.3s ease-out;
  }

  .skip-link:focus {
    top: 16px;
  }
</style>
