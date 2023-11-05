import Fastify  from "fastify";
import * as dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import router from "./router";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = Fastify({ logger: true });

server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
});

server.register(router);

const start = async () => {
    try {
        await server.listen(PORT);
        console.log(`Server listening on port ${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
