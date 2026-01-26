type AppEnv = "development" | "test" | "production";

const ENV: AppEnv = (process.env.APP_MODE as AppEnv) || "development";

const dbConfig = {
  development: {
    uri: process.env.MONGO_URI_LOCAL,
  },
  test: {
    uri: process.env.MONGO_URI_TEST,
  },
  production: {
    uri: process.env.MONGO_URI_PROD,
  },
};

export const getDbUri = (): string => {
  const uri = dbConfig[ENV].uri;

  if (!uri) {
    throw new Error(`Database URI not set for environment: ${ENV}`);
  }

  console.log(`📦 Connecting to ${ENV} database...`);
  return uri;
};
