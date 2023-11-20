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
const fonts_controller_1 = __importDefault(require("./controllers/fonts-controller"));
const icons_controller_1 = __importDefault(require("./controllers/icons-controller"));
const photos_controller_1 = __importDefault(require("./controllers/photos-controller"));
const designs_controller_1 = __importDefault(require("./controllers/designs-controller"));
function router(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(fonts_controller_1.default),
            fastify.register(icons_controller_1.default),
            fastify.register(photos_controller_1.default, { prefix: "/api/v1/photos" }),
            fastify.register(designs_controller_1.default, { prefix: "/api/v1/designs" });
    });
}
exports.default = router;
