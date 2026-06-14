/*
  the prefixes for pages' key
*/
const KNIGHT_PREFIX = 'KNIGHT__';

export function addKnightPrefix(key) {
  if (!key || key.startsWith(KNIGHT_PREFIX)) return key;
  return KNIGHT_PREFIX + key;
}

export function removeKnightPrefix(key) {
  if (!key) return key;
  return key.replace(new RegExp(`^${KNIGHT_PREFIX}`), '');
}
