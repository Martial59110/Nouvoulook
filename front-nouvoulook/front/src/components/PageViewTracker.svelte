<script lang="ts">
  import { onMount } from 'svelte';

  const recordPageView = async () => {
    try {
      const response = await fetch('/api/statistics/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la visite');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la visite:', error);
    }
  };

  onMount(() => {
    recordPageView();
  });
</script> 