import { prisma } from "./db-connect";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
import AWS from "aws-sdk";
import { PassThrough } from 'stream';
import { createCanvas, registerFont } from "canvas";

const s3 = new AWS.S3();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

dotenv.config();


async function generateFontImage(fontFamily: string, variant: string, fontUrl: string)  {
 // Download the font file
    const fontPath = `/tmp/${fontFamily}-${variant}.ttf`;
    const writer = fs.createWriteStream(fontPath);
    const response = await axios({
        url: fontUrl,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    console.log(`Downloaded font for ${fontFamily} variant ${variant}`);

    // Register font
    registerFont(fontPath, { family: fontFamily, weight: variant });

    const canvas = createCanvas(360, 40);
    const ctx = canvas.getContext('2d');

    // Set font properties
    ctx.fillStyle = 'black'; // Ensure the text color contrasts with the background
    ctx.font = `20px "${fontFamily}"`; // Adjust font size if necessary
    ctx.fillText(`${fontFamily} ${variant}`, 10, 20);

    console.log(`Generated image for ${fontFamily} variant ${variant}`);

    // Optionally, remove the font file after using it
    fs.unlinkSync(fontPath);

    const buffer =  canvas.toBuffer('image/png');

    const bucketName = 'prodsnap-fonts';
    const key = `fonts/${fontFamily}_${variant}.png`;

    // Convert buffer to stream
    const bufferStream = new PassThrough();
    bufferStream.end(buffer);

    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: bufferStream,
        ContentType: 'image/png',
    };

    try {
        const data = await s3.upload(uploadParams).promise();
        return data.Location;  // URL of the uploaded image
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
}

export async function loadFonts() {
    // Google fonts api sample: https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR-API-KEY
    // make a request to the google fonts api
    // get the list of fonts

    try {
        const res = await axios.get(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.GOOGLE_FONTS_API_KEY}`
        );

        for (const font of res.data.items.slice(400, 600)) {
            // Upsert family, category, and kind
            let family = await prisma.family.upsert({
                where: { name: font.family },
                update: {}, // No update needed since we just want to find or create
                create: { name: font.family },
            });

            let category = await prisma.category.upsert({
                where: { name: font.category },
                update: {},
                create: { name: font.category },
            });

            let kind = await prisma.kind.upsert({
                where: { name: font.kind },
                update: {},
                create: { name: font.kind },
            });

            let fontVariants = [];
            // Generate imageUrl for each variant
            for (let variant of font.variants) {
                const imageUrl = await generateFontImage(font.family, variant, font.files[variant]);
                fontVariants.push({
                    name: variant,
                    imageUrl: imageUrl,
                });
            }

            // Insert the font along with its variants
            await prisma.font.create({
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

    } catch (err) {
        console.log(err);
    }
}

loadFonts();
