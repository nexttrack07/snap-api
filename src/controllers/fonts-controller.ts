import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import { prisma } from "../db-connect";
import { clerkPreHandler } from "../auth";
import fastifyPlugin from "fastify-plugin";

type FontRequest = FastifyRequest<{
    Querystring: { page: number };
}>;

const fontController: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/user
  fastify.get("/api/v1/fonts", { preHandler: clerkPreHandler }, async function (
    request: any,
    reply: FastifyReply
  ) {
    const fonts = await prisma.font.findMany({
        include: {
            family: true, // Include details from the Family model
            category: true, // Include details from the Category model
            kind: true, // Include details from the Kind model
            variants: true, // Include details from the Variant model
        },
        skip: (request.query.page - 1) * 30,
        take: 30
    });

    // Format the results to match the desired object structure
    const formattedFonts = fonts.map((font) => ({
        fontFamily: font.family.name,
        category: font.category.name,
        kind: font.kind.name,
        variants: font.variants.map((variant) => ({
            name: variant.name,
            imageUrl: variant.imageUrl,
        })),
    }));

    return {
        fonts: formattedFonts,
        nextPage: +request.query.page + 1,
    }
  });
}

export default fastifyPlugin(fontController);