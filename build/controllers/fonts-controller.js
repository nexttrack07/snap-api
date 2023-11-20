"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_connect_1 = require("../db-connect");
const auth_1 = require("../auth");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const fontController = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    // GET /api/v1/user
    fastify.get("/api/v1/fonts", { preHandler: auth_1.clerkPreHandler }, function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const fonts = yield db_connect_1.prisma.font.findMany({
                include: {
                    family: true,
                    category: true,
                    kind: true,
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
            };
        });
    });
});
exports.default = (0, fastify_plugin_1.default)(fontController);
