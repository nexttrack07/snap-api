import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import axios from "axios";
import FormData from "form-data";
import OAuth from "oauth";
// import { redis } from "../db-connect";
import { clerkPreHandler } from "../auth";
import fastifyPlugin from "fastify-plugin";

/*
FLATICON API TO SEARCH:
var headers = {
  'Accept':'application/json',
  'Authorization':'string'

};

$.ajax({
  url: 'https://api.flaticon.com/v3/search/icons/{orderBy}',
  method: 'get',
  data: '?q=string',
  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})
Auth: 

var headers = {
  'Content-Type':'multipart/form-data',
  'Accept':'application/json'

};
Parameter Name: apiKey, in: body.

$.ajax({
  url: 'https://api.flaticon.com/v3/app/authentication',
  method: 'post',

  headers: headers,
  success: function(data) {
    console.log(JSON.stringify(data));
  }
})

*/


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

// function getIconSearch(term: string, token: string) {
//     return axios.get(`https://api.flaticon.com/v3/search/icons/orderBy=popular?q=${term}`, {
//         headers: {
//             Accept: "application/json",
//             Authorization: token,
//         },
//     });
// }


export default fastifyPlugin(iconController);