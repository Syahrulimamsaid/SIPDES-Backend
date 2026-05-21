import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("redis connect");
});

redis.on("ready", () => {
  console.log("redis ready");
});

redis.on("error", (err) => {
  console.log(err);
});

export default redis;
