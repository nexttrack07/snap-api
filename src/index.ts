import { fastify  } from "fastify";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT || 5000;
const server = fastify({ logger: true });

const prisma = new PrismaClient();

server.get("/fonts", async (request, reply) => {
    const fonts = await prisma.font.findMany();
    return fonts;
})

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