import Fastify  from "fastify";
import * as dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import router from "./router";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const server = Fastify({ logger: !!(process.env.NODE_ENV !== "development") });

server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
});

server.register(router);

server.listen({ port: PORT });