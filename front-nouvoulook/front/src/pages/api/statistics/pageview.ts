import type { APIRoute } from 'astro';

// Désactiver le prérendu pour cet endpoint
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { path, userAgent } = body;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

    // Vérifier si c'est un bot
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
    if (isBot) {
      return new Response(JSON.stringify({ message: 'Bot détecté, visite ignorée' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Appeler l'API backend pour enregistrer la visite
    const response = await fetch(`${import.meta.env.API_URL}/statistics/pageview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        ipAddress,
        userAgent,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        message: 'Erreur lors de l\'enregistrement de la visite',
        details: responseData 
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Visite enregistrée avec succès',
      details: responseData 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      message: 'Erreur lors de l\'enregistrement de la visite',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 