const appMode = import.meta.env.VITE_APP_MODE;

const baseImageUrl =
  appMode === "local"
    ? import.meta.env.VITE_BACKEND_URL_LOCAL
    : import.meta.env.VITE_BACKEND_URL_PROD;

export const getImageUrl = (url: string) => {
  if (url.includes("http://") || url.includes("https://")) return url;

  return `${baseImageUrl}${url}`;
};
