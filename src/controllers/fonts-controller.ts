import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db-connect";

type FontRequest = FastifyRequest<{
    Querystring: { page: number };
}>;

export default async function fontController(fastify: FastifyInstance) {
  // GET /api/v1/user
  fastify.get("/", async function (
    request: FontRequest,
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
        nextPage: request.query.page + 1,
    }
  });
}