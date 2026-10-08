import { getGameDetails, getGameScreenshots, getGameAdditions, getGameSeries, getGameStores, getGameMovies } from "$lib/api.js";

/**
 * @param {Promise<any>} p
 */
async function safe(p) {
  try {
    return await p;
  } catch {
    return [];
  }
}

export async function load({ params, fetch }) {
  try {
    const game = await getGameDetails(params.id, fetch);
    const [screenshots, additions, series, stores, movies] = await Promise.all([
      safe(getGameScreenshots(params.id, fetch)),
      safe(getGameAdditions(params.id, fetch)),
      safe(getGameSeries(params.id, fetch)),
      safe(getGameStores(params.id, fetch)),
      safe(getGameMovies(params.id, fetch)),
    ]);

    return {
      game,
      screenshots,
      additions,
      series,
      stores,
      movies,
    };
  } catch (error) {
    console.error("Failed to load game details:", error);
    return {
      game: null,
      screenshots: [],
      additions: [],
      series: [],
      stores: [],
      movies: [],
      error: "Falha ao carregar detalhes do jogo.",
    };
  }
}
