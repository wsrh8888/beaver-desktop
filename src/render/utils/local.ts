
export const getLocal = (key: string): string | null => {
  return localStorage.getItem(key);
}