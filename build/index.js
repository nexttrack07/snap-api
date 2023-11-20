"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const fastify_cloudinary_1 = __importDefault(require("fastify-cloudinary"));
const fastify_2 = require("@clerk/fastify");
const router_1 = __importDefault(require("./router"));
dotenv.config();
console.log("CLERK_SECRET_KEY", process.env.CLERK_SECRET_KEY);
console.log("CLERK_PUBLISHABLE_KEY", process.env.CLERK_PUBLISHABLE_KEY);
const PORT = Number(process.env.PORT) || 5000;
const server = (0, fastify_1.default)({ logger: !!(process.env.NODE_ENV !== "development") });
server.register(cors_1.default, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
});
server.register(fastify_2.clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
});
server.register(multipart_1.default);
server.register(fastify_cloudinary_1.default, { url: process.env.CLOUDINARY_CLOUD_URL });
server.register(router_1.default);
if (process.env.NODE_ENV === "production") {
    server.listen({ port: PORT, host: "0.0.0.0" });
}
else {
    server.listen({ port: PORT });
}
