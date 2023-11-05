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

if (process.env.NODE_ENV === "production") {
    server.listen({ port: PORT, host: "0.0.0.0" })
} else {
    server.listen({ port: PORT })
}