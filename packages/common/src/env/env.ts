import z from "zod";

type Env = z.infer<typeof Schema>;

const Schema = z.object({
  environment: z.enum(["development", "production", "staging"]),

  database: z.object({
    name: z.string("Database name is required for the application work."),
    uri: z.string("Mongo URI is required for the application work."),
  }),

  server: z.object({
    port: z.number("Server port is required for the application work."),
    allowedOrigins: z
      .array(z.string())
      .min(1, "Allowed origins are required for the application work."),
  }),

  redis: z.object({
    host: z.string("redis.host is required for the application work."),
    port: z.number("redis.port is required for the application work."),
  }),
});

const env = Schema.parse({
  environment:
    (process.env.NODE_ENV as "development" | "production" | "staging") ||
    ("development" as const),
  database: {
    name: process.env.DATABASE_NAME || "org",
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    allowedOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["*"],
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
});

export { env };
export type { Env };
