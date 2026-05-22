/**
 * Mapeamento de cores para gêneros de jogos
 * @typedef {{ light: string; dark: string; name: string }} GenreColor
 * @type {Record<string, GenreColor>}
 */
export const genreColorMap = {
  action: { light: "#ff6b35", dark: "#ff8c57", name: "--genre-action" },
  rpg: { light: "#a855f7", dark: "#c084fc", name: "--genre-rpg" },
  strategy: { light: "#ef4444", dark: "#f87171", name: "--genre-strategy" },
  adventure: { light: "#06b6d4", dark: "#22d3ee", name: "--genre-adventure" },
  puzzle: { light: "#f59e0b", dark: "#fbbf24", name: "--genre-puzzle" },
  shooter: { light: "#8b5cf6", dark: "#a78bfa", name: "--genre-shooter" },
  sports: { light: "#10b981", dark: "#34d399", name: "--genre-sports" },
  racing: { light: "#ec4899", dark: "#f472b6", name: "--genre-racing" },
  indie: { light: "#06b6d4", dark: "#22d3ee", name: "--genre-indie" },
  simulation: { light: "#14b8a6", dark: "#2dd4bf", name: "--genre-simulation" },
  casual: { light: "#f59e0b", dark: "#fbbf24", name: "--genre-puzzle" },
  educational: { light: "#10b981", dark: "#34d399", name: "--genre-sports" },
};

/**
 * Obter cor para um gênero específico
 * @param {string} genreName - Nome do gênero
 * @returns {string} Cor em hex ou cor padrão
 */
export function getGenreColor(genreName) {
  if (!genreName) return "#7c3aed";
  const normalized = genreName.toLowerCase().trim();
  const match = Object.entries(genreColorMap).find(
    ([key]) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? match[1].light : "#7c3aed";
}

/**
 * Obter cor CSS do gênero
 * @param {string} genreName - Nome do gênero
 * @returns {string} Variável CSS
 */
export function getGenreColorVar(genreName) {
  if (!genreName) return "var(--accent-purple)";
  const normalized = genreName.toLowerCase().trim();
  const match = Object.entries(genreColorMap).find(
    ([key]) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? `var(${match[1].name})` : "var(--accent-purple)";
}
