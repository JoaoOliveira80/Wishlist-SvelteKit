import { writable } from "svelte/store";

function readStoredWishlist() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const rawValue = localStorage.getItem("wishlist");
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export const wishlist = writable(readStoredWishlist());

wishlist.subscribe((value) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("wishlist", JSON.stringify(value));
  }
});

/**
 * @param {{ id: number }} game
 */
export function toggleWishlist(game) {
  wishlist.update((list) => {
    const exists = list.find((g) => g.id === game.id);
    return exists ? list.filter((g) => g.id !== game.id) : [...list, game];
  });
}

/**
 * @param {{ id: number }[]} list
 * @param {{ id: number }} game
 */
export function isInWishlist(list, game) {
  return list.some((g) => g.id === game.id);
}
