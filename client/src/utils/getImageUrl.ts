const baseImageUrl = import.meta.env.VITE_BACKEND_URL_LOCAL;
export const getImageUrl = (url: string) => {
  if (url.includes("http://") || url.includes("https://")) return url;

  return `${baseImageUrl}${url}`;
};
