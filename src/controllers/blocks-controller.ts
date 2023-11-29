import { clerkPreHandler } from "../auth";
import { FastifyInstance } from "fastify";
import { getAuth } from "@clerk/fastify";
import { prisma } from "../db-connect";
import blocksRepo, {
  Block,
  BlockType,
  BlockCategory,
  BlockCategoryType,
} from "../repositories/blocks-repo";
import { screenshotQueue } from "../lib/queue";

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
    async (request, reply) => {
      const { elements, categoryId, url } = request.body;
      const auth = getAuth(request);
      const userId = auth.userId as string;
      const data = {
        elements,
        userId,
        categoryId,
        url: url || "",
      };

      try {
        const block = await blocksRepo.createBlock(data, userId);
        // Add a job to the queue
        screenshotQueue.add({
          url: (process.env.BLOCK_SCREENSHOT_URL as string) + block.id,
          id: block.id,
          selector: "#preview-canvas"
        });

        reply.status(200).send(block);
      } catch (err: any) {
        console.error(err);
        reply.status(500).send(err.message);
      }
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
  fastify.get<{ Reply: BlockCategoryType[] }>(
    "/category",
    async (request, reply) => {
      const categories = await blocksRepo.getAllCategories();
      reply.status(200).send(categories);
    }
  );

  // get block by id
  fastify.get<{ Params: { id: string }; Reply: BlockType | null }>(
    "/:id",
    async (request, reply) => {
      const block = await blocksRepo.getBlockById(request.params.id);
      reply.status(200).send(block);
    }
  );
}
