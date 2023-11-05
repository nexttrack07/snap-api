import { FastifyInstance } from "fastify";
import fontController from "./controllers/fonts-controller";


export default async function router(fastify: FastifyInstance) {
    fastify.register(fontController, { prefix: "/api/v1/fonts" })
}