<script>
  import { onMount, onDestroy } from 'svelte';
  let partners = [];
  let loading = true;
  let error = '';
  let currentIndex = 0;
  const visibleCount = 5; // nombre d'images visibles à la fois
  let intervalId;

  async function fetchPartners() {
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/partners`);
      if (!res.ok) throw new Error('Erreur lors du chargement des partenaires');
      partners = await res.json();
    } catch (e) {
      error = e.message || 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }

  function autoScroll() {
    if (partners.length > visibleCount) {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % (partners.length - visibleCount + 1);
      }, 3000);
    }
  }

  onMount(() => {
    fetchPartners().then(() => {
      autoScroll();
    });
  });
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<div class="partners-carousel-wrapper my-4">
  <h2 class="mb-4 text-center" style="font-size:2rem; color:#3a2d4d;">Nos partenaires</h2>
  {#if loading}
    <div class="text-center text-muted">Chargement...</div>
  {:else if error}
    <div class="text-danger text-center">{error}</div>
  {:else if partners.length === 0}
    <div class="text-center text-muted">Aucun partenaire pour le moment</div>
  {:else}
    <div class="partners-carousel-track d-flex flex-row align-items-center justify-content-center overflow-hidden">
      {#each partners.slice(currentIndex, currentIndex + visibleCount) as partner (partner.id)}
        <div class="partner-logo-wrapper mx-3">
          <img src={partner.imageUrl.startsWith('/assets') ? `${import.meta.env.PUBLIC_API_URL || 'http://localhost:3001'}${partner.imageUrl}` : partner.imageUrl} alt={partner.name} class="partner-logo" loading="lazy" />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
.partners-carousel-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.partners-carousel-track {
  min-height: 120px;
  padding: 1rem 0;
  transition: transform 0.3s;
}
.partner-logo-wrapper {
  flex: 0 0 auto;
  width: 160px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px 0 #0001;
  margin: 0 0.5rem;
}
.partner-logo {
  max-width: 140px;
  max-height: 80px;
  object-fit: contain;
  display: block;
}
@media (max-width: 900px) {
  .partner-logo-wrapper {
    width: 110px;
    height: 70px;
  }
  .partner-logo {
    max-width: 90px;
    max-height: 50px;
  }
}
</style> 