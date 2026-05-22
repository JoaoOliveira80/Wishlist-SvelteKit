const BASE = "/api/rawg";

/**
 * @typedef {{
 *   id: number;
 *   name: string;
 *   slug?: string;
 *   rating?: number;
 *   released?: string;
 *   background_image?: string;
 *   description?: string;
 *   description_raw?: string;
 *   metacritic?: number;
 *   playtime?: number;
 *   genres?: Array<{ id: number; name: string; slug: string }>;
 *   platforms?: Array<{ id: number; name: string; slug: string; platform: {id: number; name: string; slug: string} }>;
 *   developers?: Array<{ id: number; name: string; slug: string }>;
 *   publishers?: Array<{ id: number; name: string; slug: string }>;
 *   esrb_rating?: { id: number; slug: string; name: string };
 *   screenshots_count?: number;
 *   achievements_count?: number;
 *   reddit_url?: string;
 *   website?: string;
 * }} Game
 */

/**
 * @typedef {{
 *   id: number;
 *   image: string;
 *   image_background?: string;
 * }} Screenshot
 */

/**
 * @typedef {{
 *   id: number;
 *   name: string;
 *   slug: string;
 *   image_background: string;
 *   games_count: number;
 * }} Genre
 */

/**
 * @typedef {{
 *   id: number;
 *   name: string;
 *   slug: string;
 *   image_background: string;
 *   games_count: number;
 * }} Platform
 */

const detailsCache = new Map();

/**
 * @param {string} path
 * @param {Record<string, string | number>} params
 */
function buildUrl(path, params = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append("path", path);

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      searchParams.append(key, String(value));
    }
  }

  return `${BASE}?${searchParams.toString()}`;
}

/**
 * @param {Record<string, string | number | boolean | Array<string | number> | undefined>} params
 * @returns {Record<string, string | number>}
 */
function normalizeParams(params) {
  /** @type {Record<string, string | number>} */
  const normalized = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      continue;
    }

    normalized[key] = Array.isArray(value) ? value.join(",") : String(value);
  }

  return normalized;
}

/**
 * @param {any} data
 * @returns {Game[]}
 */
function normalizeGamesResponse(data) {
  if (!Array.isArray(data?.results)) {
    return [];
  }
  return data.results.map((/** @type {any} */ game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    rating: game.rating,
    released: game.released,
    background_image: game.background_image,
    description_raw: game.description_raw || game.description || "",
    genres: game.genres,
    platforms: game.platforms,
    developers: game.developers,
    publishers: game.publishers,
    esrb_rating: game.esrb_rating,
    metacritic: game.metacritic,
    playtime: game.playtime,
  }));
}

/**
 * @param {string} query
 * @returns {Promise<Game[]>}
 */
export async function searchGames(query) {
  if (!query || query.length < 2) return [];

  const response = await fetch(
    buildUrl("/games", {
      search: query,
      search_precise: "false",
      page_size: 12,
    }),
  );
  if (!response.ok) {
    throw new Error(`RAWG request failed with status ${response.status}`);
  }
  const data = await response.json();
  return normalizeGamesResponse(data);
}

export async function getPopularGames() {
  const response = await fetch(
    buildUrl("/games", {
      ordering: "-rating",
      page_size: 12,
    }),
  );
  if (!response.ok) {
    throw new Error(`RAWG request failed with status ${response.status}`);
  }
  const data = await response.json();
  return normalizeGamesResponse(data);
}

/**
 * Get full game details with all metadata
 * @param {number | string} gameId
 * @returns {Promise<Game>}
 */
export async function getGameDetails(gameId) {
  if (detailsCache.has(gameId)) {
    return detailsCache.get(gameId);
  }

  const response = await fetch(buildUrl(`/games/${gameId}`));
  if (!response.ok) {
    throw new Error(`Failed to fetch game details: ${response.status}`);
  }

  const game = await response.json();
  detailsCache.set(gameId, game);
  return game;
}

/**
 * Get screenshots for a game
 * @param {number | string} gameId
 * @returns {Promise<Screenshot[]>}
 */
export async function getGameScreenshots(gameId) {
  const response = await fetch(
    buildUrl(`/games/${gameId}/screenshots`, { page_size: 5 }),
  );
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * Get all genres
 * @returns {Promise<Genre[]>}
 */
export async function getAllGenres() {
  const response = await fetch(buildUrl("/genres", { page_size: 50 }));
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * Get all platforms
 * @returns {Promise<Platform[]>}
 */
export async function getAllPlatforms() {
  const response = await fetch(buildUrl("/platforms", { page_size: 50 }));
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * Get all parent platforms
 * @returns {Promise<Platform[]>}
 */
export async function getAllParentPlatforms() {
  const response = await fetch(
    buildUrl("/platforms/lists/parents", { page_size: 20 }),
  );
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * @typedef {{
 *   id: number;
 *   name: string;
 *   slug: string;
 *   games_count: number;
 *   image_background: string;
 *   description?: string;
 * }} Tag
 */

/**
 * Get all tags
 * @returns {Promise<Tag[]>}
 */
export async function getAllTags() {
  const response = await fetch(buildUrl("/tags", { page_size: 50 }));
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
}

/**
 * Search games with filters
 * @param {{
 *   search?: string;
 *   genres?: string[];
 *   platforms?: string[];
 *   parent_platforms?: string[];
 *   tags?: string[];
 *   rating_min?: number;
 *   rating_max?: number;
 *   search_exact?: boolean;
 *   search_precise?: boolean;
 *   dates?: string;
 *   updated?: string;
 *   ordering?: string;
 *   page?: number;
 *   page_size?: number;
 * }} filters
 * @returns {Promise<{results: Game[], count: number, next: string | null, previous: string | null}>}
 */
export async function getGamesByFilters(filters = {}) {
  /** @type {Record<string, string | number | boolean | Array<string | number> | undefined>} */
  const params = {
    page_size: filters.page_size || 20,
    page: filters.page || 1,
    ordering: filters.ordering || "-rating",
  };

  if (filters.search && filters.search.length >= 2) {
    params.search = filters.search;
  }

  if (filters.genres && filters.genres.length > 0) {
    params.genres = filters.genres;
  }

  if (filters.platforms && filters.platforms.length > 0) {
    params.platforms = filters.platforms;
  }

  if (filters.parent_platforms && filters.parent_platforms.length > 0) {
    params.parent_platforms = filters.parent_platforms;
  }

  if (filters.tags && filters.tags.length > 0) {
    params.tags = filters.tags;
  }

  if (filters.rating_min != null || filters.rating_max != null) {
    const minRating = filters.rating_min ?? 0;
    const maxRating = filters.rating_max ?? 5;
    params.metacritic = `${Math.round(minRating * 20)},${Math.round(maxRating * 20)}`;
  }

  if (filters.search_exact != null) {
    params.search_exact = filters.search_exact;
  }

  if (filters.search_precise != null) {
    params.search_precise = filters.search_precise;
  }

  if (filters.dates) {
    params.dates = filters.dates;
  }

  if (filters.updated) {
    params.updated = filters.updated;
  }

  const response = await fetch(buildUrl("/games", normalizeParams(params)));
  if (!response.ok) {
    throw new Error(`RAWG request failed with status ${response.status}`);
  }
  const data = await response.json();
  return {
    results: normalizeGamesResponse(data),
    count: data.count || 0,
    next: data.next || null,
    previous: data.previous || null,
  };
}
