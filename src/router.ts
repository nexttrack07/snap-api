import { FastifyInstance } from "fastify";
import fontController from "./controllers/fonts-controller";
import iconController from "./controllers/icons-controller";
import photosController from "./controllers/photos-controller";


export default async function router(fastify: FastifyInstance) {
    fastify.register(fontController),
    fastify.register(iconController),
    fastify.register(photosController, { prefix: "/api/v1/photos" })
}