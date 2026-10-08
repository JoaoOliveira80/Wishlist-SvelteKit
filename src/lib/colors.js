/**
 * Mapeamento de cores para gêneros de jogos
 * @typedef {{ light: string; dark: string; name: string }} GenreColor
 */
/** @type {Record<string, string>} */
export const VOID_ARCADE = {
  lime: '#d7f542',
  limeSoft: '#e6ff70',
  violet: '#8b5cf6',
  violetSoft: '#a78bfa',
  pink: '#ff6aa8',
  gold: '#ffb224',
  void: '#06080e',
};

/** @type {Record<string, import('./colors.js').GenreColor>} */
export const genreColorMap = {
  action: { light: '#d7f542', dark: '#e6ff70', name: '--genre-action' },
  rpg: { light: '#8b5cf6', dark: '#a78bfa', name: '--genre-rpg' },
  strategy: { light: '#8b5cf6', dark: '#c4b5fd', name: '--genre-strategy' },
  adventure: { light: '#a78bfa', dark: '#c4b5fd', name: '--genre-adventure' },
  puzzle: { light: '#d7f542', dark: '#e6ff70', name: '--genre-puzzle' },
  shooter: { light: '#8b5cf6', dark: '#c4b5fd', name: '--genre-shooter' },
  sports: { light: '#d7f542', dark: '#b5d63a', name: '--genre-sports' },
  racing: { light: '#ff6aa8', dark: '#ff9ac4', name: '--genre-racing' },
  indie: { light: '#ffb224', dark: '#ffc75a', name: '--genre-indie' },
  simulation: { light: '#a78bfa', dark: '#c4b5fd', name: '--genre-simulation' },
  casual: { light: '#d7f542', dark: '#e6ff70', name: '--genre-puzzle' },
  educational: { light: '#ffb224', dark: '#ffc75a', name: '--genre-sports' },
};

/**
 * Obter cor para um gênero específico
 * @param {string} genreName - Nome do gênero
 * @returns {string} Cor em hex ou cor padrão
 */
export function getGenreColor(genreName) {
  if (!genreName) return VOID_ARCADE.violet;
  const normalized = genreName.toLowerCase().trim();
  const match = Object.entries(genreColorMap).find(
    ([key]) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? match[1].light : VOID_ARCADE.lime;
}

/**
 * Obter cor CSS do gênero
 * @param {string} genreName - Nome do gênero
 * @returns {string} Variável CSS
 */
export function getGenreColorVar(genreName) {
  if (!genreName) return "var(--violet)";
  const normalized = genreName.toLowerCase().trim();
  const match = Object.entries(genreColorMap).find(
    ([key]) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? `var(${match[1].name})` : "var(--violet)";
}
