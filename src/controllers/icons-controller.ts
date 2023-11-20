import { FastifyInstance, FastifyReply, FastifyPluginAsync } from "fastify";
import OAuth from "oauth";
import { clerkPreHandler } from "../auth";
import fastifyPlugin from "fastify-plugin";

const opts = {
  preHandler: clerkPreHandler,
}

 const iconController: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get("/api/v1/icons", opts, async function (request: any, reply: FastifyReply) {
        try {
            // Initialize OAuth with the correct consumer key and secret.
            const oauth = new OAuth.OAuth(
                "https://api.thenounproject.com",
                "https://api.thenounproject.com",
                process.env.NOUN_PROJECT_API_KEY as string,
                process.env.NOUN_PROJECT_API_SECRET as string,
                "1.0",
                null,
                "HMAC-SHA1"
            );

            // Wrap the oauth.get call in a new Promise to handle it asynchronously.
            const data = await new Promise((resolve, reject) => {
                oauth.get(
                    `https://api.thenounproject.com/v2/icon?query=${request.query.q}&limit_to_public_domain=1&include_svg=1`,
                    "",
                    "",
                    (e, data, res) => {
                        if (e) reject(e);
                        resolve(data);
                    }
                );
            });
            // Parse the data and send it as a response.

            return data;
        } catch (e: any) {
            // Handle errors.
            console.log("Error: ", e);
            reply.code(500).send({ error: e.message });
        }
    });
}


export default fastifyPlugin(iconController);