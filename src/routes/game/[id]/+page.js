import { getGameDetails, getGameScreenshots } from '$lib/api.js';

export async function load({ params, fetch }) {
  try {
    const [game, screenshots] = await Promise.all([
      getGameDetails(params.id),
      getGameScreenshots(params.id),
    ]);

    return {
      game,
      screenshots,
    };
  } catch (error) {
    console.error('Failed to load game details:', error);
    return {
      game: null,
      screenshots: [],
      error: 'Falha ao carregar detalhes do jogo.',
    };
  }
}
