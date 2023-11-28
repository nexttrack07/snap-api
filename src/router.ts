import { FastifyInstance } from "fastify";
import fontController from "./controllers/fonts-controller";
import iconController from "./controllers/icons-controller";
import photosController from "./controllers/photos-controller";
import designsController from "./controllers/designs-controller";
import blocksController from "./controllers/blocks-controller";


export default async function router(fastify: FastifyInstance) {
    fastify.register(fontController),
    fastify.register(iconController),
    fastify.register(photosController, { prefix: "/api/v1/photos" }),
    fastify.register(designsController, { prefix: "/api/v1/designs" }),
    fastify.register(blocksController, { prefix: "/api/v1/blocks" })
}