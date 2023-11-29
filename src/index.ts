import Fastify   from "fastify";
import * as dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import cloudinary from 'fastify-cloudinary';
import {  clerkPlugin } from "@clerk/fastify";
import router from "./router";

dotenv.config();

console.log("CLERK_SECRET_KEY", process.env.CLERK_SECRET_KEY);
console.log("CLERK_PUBLISHABLE_KEY", process.env.CLERK_PUBLISHABLE_KEY);

const PORT = Number(process.env.PORT) || 5000;
type LoggerConfig = {
    development: any
    production: any
    test: any
  };

  const envToLogger: LoggerConfig = {
    development: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    production: true,
    test: false,
  };
  
const server = Fastify({ 
logger: envToLogger[process.env.NODE_ENV as keyof LoggerConfig] || true
});

server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
});

server.register(clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY as string,
    secretKey: process.env.CLERK_SECRET_KEY as string,
});
server.register(fastifyMultipart);
server.register(cloudinary, { url: process.env.CLOUDINARY_CLOUD_URL as string })
server.register(router);

if (process.env.NODE_ENV === "production") {
    server.listen({ port: PORT, host: "0.0.0.0" })
} else {
    server.listen({ port: PORT })
}