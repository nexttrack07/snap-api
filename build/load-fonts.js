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
exports.loadFonts = void 0;
const db_connect_1 = require("./db-connect");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const stream_1 = require("stream");
const canvas_1 = require("canvas");
const s3 = new aws_sdk_1.default.S3();
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
dotenv.config();
function generateFontImage(fontFamily, variant, fontUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        // Download the font file
        const fontPath = `/tmp/${fontFamily}-${variant}.ttf`;
        const writer = fs_1.default.createWriteStream(fontPath);
        const response = yield (0, axios_1.default)({
            url: fontUrl,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(writer);
        yield new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log(`Downloaded font for ${fontFamily} variant ${variant}`);
        // Register font
        (0, canvas_1.registerFont)(fontPath, { family: fontFamily, weight: variant });
        const canvas = (0, canvas_1.createCanvas)(360, 40);
        const ctx = canvas.getContext('2d');
        // Set font properties
        ctx.fillStyle = 'black'; // Ensure the text color contrasts with the background
        ctx.font = `20px "${fontFamily}"`; // Adjust font size if necessary
        ctx.fillText(`${fontFamily} ${variant}`, 10, 20);
        console.log(`Generated image for ${fontFamily} variant ${variant}`);
        // Optionally, remove the font file after using it
        fs_1.default.unlinkSync(fontPath);
        const buffer = canvas.toBuffer('image/png');
        const bucketName = 'prodsnap-fonts';
        const key = `fonts/${fontFamily}_${variant}.png`;
        // Convert buffer to stream
        const bufferStream = new stream_1.PassThrough();
        bufferStream.end(buffer);
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: bufferStream,
            ContentType: 'image/png',
        };
        try {
            const data = yield s3.upload(uploadParams).promise();
            return data.Location; // URL of the uploaded image
        }
        catch (error) {
            console.error('Error uploading to S3:', error);
            throw error;
        }
    });
}
function loadFonts() {
    return __awaiter(this, void 0, void 0, function* () {
        // Google fonts api sample: https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR-API-KEY
        // make a request to the google fonts api
        // get the list of fonts
        try {
            const res = yield axios_1.default.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.GOOGLE_FONTS_API_KEY}`);
            for (const font of res.data.items.slice(400, 600)) {
                // Upsert family, category, and kind
                let family = yield db_connect_1.prisma.family.upsert({
                    where: { name: font.family },
                    update: {},
                    create: { name: font.family },
                });
                let category = yield db_connect_1.prisma.category.upsert({
                    where: { name: font.category },
                    update: {},
                    create: { name: font.category },
                });
                let kind = yield db_connect_1.prisma.kind.upsert({
                    where: { name: font.kind },
                    update: {},
                    create: { name: font.kind },
                });
                let fontVariants = [];
                // Generate imageUrl for each variant
                for (let variant of font.variants) {
                    const imageUrl = yield generateFontImage(font.family, variant, font.files[variant]);
                    fontVariants.push({
                        name: variant,
                        imageUrl: imageUrl,
                    });
                }
                // Insert the font along with its variants
                yield db_connect_1.prisma.font.create({
                    data: {
                        family: { connect: { id: family.id } },
                        category: { connect: { id: category.id } },
                        kind: { connect: { id: kind.id } },
                        subsets: font.subsets,
                        variants: {
                            create: fontVariants
                        },
                    },
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.loadFonts = loadFonts;
loadFonts();
