import { getAuth } from "@clerk/fastify";
import { FastifyInstance } from "fastify";
import { prisma } from "../db-connect";
import { Static, Type } from "@sinclair/typebox";
import { clerkPreHandler } from "../auth";

const Design = Type.Object({
  id: Type.Optional(Type.String()), // optional
  userId: Type.Optional(Type.String()),
  name: Type.String(),
  canvas: Type.Object({
    width: Type.Number(),
    height: Type.Number(),
    background: Type.String(),
    elements: Type.String(),
    fonts: Type.Array(Type.String()),
  }),
});

type DesignType = Static<typeof Design>;

export default async function designsController(fastify: FastifyInstance) {
  fastify.post<{ Body: DesignType; Reply: DesignType }>(
    "/",
    {
      schema: {
        body: Design,
        response: {
          200: Design,
        },
      },
      preHandler: clerkPreHandler,
    },
    (request, reply) => {
      const { canvas, name = "untitled" } = request.body;
      const auth = getAuth(request);
      const userId = auth.userId as string;

      prisma.design
        .create({
          data: {
            name,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            userId,
            elements: "[]",
            background: "#ffffff",
            fonts: [],
          },
        })
        .then((design) => {
          // convert design to DesignType
          const { canvasWidth, canvasHeight, ...rest } = design;
          reply.status(200).send({
            ...rest,
            id: design.id,
            canvas: {
              width: canvasWidth,
              height: canvasHeight,
              background: design.background,
              elements: design.elements,
              fonts: design.fonts,
            },
          });
        });
    }
  );

  fastify.put<{ Body: DesignType; Params: { id: string }; Reply: DesignType }>(
    "/:id",
    {
      schema: {
        body: Design,
        response: {
          200: Design,
        },
      },
      preHandler: clerkPreHandler,
    },
    (request, reply) => {
      prisma.design
        .update({
          where: {
            id: request.params.id,
          },
          data: {
            // convert DesignType to design
            name: request.body.name,
            canvasWidth: request.body.canvas.width,
            canvasHeight: request.body.canvas.height,
            background: request.body.canvas.background,
            elements: request.body.canvas.elements,
            fonts: request.body.canvas.fonts,
          },
        })
        .then((design) => {
          const { canvasWidth, canvasHeight, ...rest } = design;
          reply.status(200).send({
            ...rest,
            canvas: {
              width: canvasWidth,
              height: canvasHeight,
              background: design.background,
              elements: design.elements,
              fonts: design.fonts,
            },
          });
        });
    }
  );

  fastify.get<{
    Params: { id: string };
    Reply: DesignType | { error: string };
  }>(
    "/:id",
    {
      schema: {
        response: {
          200: Design,
        },
      },
      preHandler: clerkPreHandler,
    },
    (request, reply) => {
      prisma.design
        .findUnique({
          where: {
            id: request.params.id,
          },
        })
        .then((design) => {
          if (!design) {
            reply.status(404).send({ error: "Design not found" });
          } else {
            const { canvasWidth, canvasHeight, ...rest } = design;
            reply.status(200).send({
              ...rest,
              canvas: {
                width: canvasWidth,
                height: canvasHeight,
                background: design.background,
                elements: design.elements,
                fonts: design.fonts,
              },
            });
          }
        });
    }
  );

  fastify.get<{ Reply: DesignType[] }>(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: Design,
          },
        },
      },
      preHandler: clerkPreHandler,
    },
    (request, reply) => {
      const auth = getAuth(request);
      const userId = auth.userId as string;

      prisma.design
        .findMany({
          where: {
            userId,
          },
        })
        .then((designs) => {
          // map designs to DesignType
          reply.status(200).send(
            designs.map((design) => {
              const { canvasWidth, canvasHeight, ...rest } = design;
              return {
                ...rest,
                canvas: {
                  width: canvasWidth,
                  height: canvasHeight,
                  background: design.background,
                  elements: design.elements,
                  fonts: design.fonts,
                },
              };
            })
          );
        });
    }
  );
}
