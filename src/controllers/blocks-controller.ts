import { Static, Type } from "@sinclair/typebox";
import { clerkPreHandler } from "../auth";
import { FastifyInstance } from "fastify";
import { getAuth } from "@clerk/fastify";
import { prisma } from "../db-connect";

const Block = Type.Object({
    id: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
    elements: Type.String(),
    url: Type.Optional(Type.String()),
    categoryId: Type.Number(),
})

export type BlockType = Static<typeof Block>

const BlockCategory = Type.Object({
    id: Type.Optional(Type.Number()),
    name: Type.String(),
})

export type BlockCategoryType = Static<typeof BlockCategory>

export default async function blocksController(fastify: FastifyInstance) {
    // post a new block
    fastify.post<{ Body: BlockType; Reply: BlockType }>(
        "/",
        {
            schema: {
                body: Block,
                response: {
                    200: Block,
                },
            },
            preHandler: clerkPreHandler,
        },
        (request, reply) => {
            const { elements, categoryId, url } = request.body;
            const auth = getAuth(request);
            const userId = auth.userId as string;

            prisma.block
                .create({
                    data: {
                        elements,
                        userId,
                        categoryId,
                        url: url || "",
                    },
                })
                .then((block) => {
                    reply.status(200).send({
                        ...block,
                        id: block.id,
                    });
                })
                .catch((err) => {
                    reply.status(500).send(err);
                });
        }
    );

    // post a new category
    fastify.post<{ Body: BlockCategoryType; Reply: BlockCategoryType }>(
        "/category",
        {
            schema: {
                body: BlockCategory,
                response: {
                    200: BlockCategory,
                },
            },
            preHandler: clerkPreHandler,
        },
        (request, reply) => {
            const { name } = request.body;

            prisma.blockCategory
                .create({
                    data: {
                        name,
                    },
                })
                .then((category) => {
                    reply.status(200).send({
                        ...category,
                        id: category.id,
                    });
                })
                .catch((err) => {
                    reply.status(500).send(err);
                });
        }
    );

    // get all categories with blocks
    fastify.get<{ Reply: BlockCategoryType[] }>("/category", async (request, reply) => {
        const categories = await prisma.blockCategory.findMany({
            include: {
                blocks: true,
            },
        });
        reply.status(200).send(categories);
    });
}