const baseImageUrl = import.meta.env.VITE_BACKEND_URL_LOCAL;
export const getImageUrl = (url: string) => {
  return `${baseImageUrl}${url}`;
};
