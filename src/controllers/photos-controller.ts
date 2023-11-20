import { FastifyInstance } from "fastify";
import { getAuth } from "@clerk/fastify";
import path from 'path';
import { removeBackgroundFromImageUrl } from 'remove.bg';
import { clerkPreHandler } from "../auth";
import stream from 'stream';
import util from 'util'; 
import { sixId, streamUpload } from "../lib/utils";
import { prisma } from "../db-connect";

const pipeline = util.promisify(stream.pipeline);

export default async function photosController(fastify: FastifyInstance) {
  fastify.post("/upload", { preHandler: clerkPreHandler }, async (request: any, reply) => {
    const data = await request.file();
    const fileNameWithoutExt: string = path.basename(data.filename, path.extname(data.filename));
    const auth = getAuth(request);
    const id = sixId();
    const userId = auth.userId as string;

    const public_id = `prodsnap-uploads/${userId}/${id}-${fileNameWithoutExt}`;

    const { url } = await streamUpload(fastify, data.file, public_id);

    await prisma.upload.create({
        data: {
          url,
          userId,
        },
      });


    return { message: "Uploaded successfully", url  }

  });


  fastify.get('/uploads', { preHandler: clerkPreHandler }, async (request: any, reply) => {
    const auth = getAuth(request);
    const userId = auth.userId as string;

    const userUploads = await prisma.upload.findMany({
        where: {
            userId
        }
    });

    return userUploads;
  })


  fastify.post('/remove-bg', { preHandler: clerkPreHandler }, async (request: any, reply) => {
    try {
        const res = await removeBackgroundFromImageUrl({
          url: request.body.url,
          apiKey: `${process.env.REMOVE_BG_API_KEY}`,
          size: 'auto'
        });

        const photo = 'data:image/jpeg;base64,' + res.base64img.replace(/(\r\n|\n|\r)/gm,"");
        const filename = sixId();
        const auth = getAuth(request);
        const userId = auth.userId as string;

        const public_id = `prodsnap-uploads/${userId}/` + filename;

        const { url } = await fastify.cloudinary.uploader.upload(photo, { public_id  });

        await prisma.upload.create({
            data: {
              url,
              userId,
            },
          });

        return { message: "Uploaded successfully", url  }
    
      } catch (errors: unknown) {
        const err = errors;
        return { error: err };
      }

  })
}
