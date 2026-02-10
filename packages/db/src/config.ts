const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const CONNECTION_STRING = connectionString;
export const USE_LOCAL_CLIENT = !!process.env.DEV_OR_INTEGRATION_USE;
