import { FastifyInstance } from "fastify";
import * as path from "path";
import { Readable, Stream } from "stream";
import { UploadApiResponse, UploadStream } from 'cloudinary';

export function getContentType(filePath: string): string {
  const ext: string = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    // Add other file extensions and MIME types as needed
  };

  return mimeTypes[ext] || "application/octet-stream";
}

export function sixId(): string {
  // Generate a number between 0 and 999999
  const randomNumber: number = Math.floor(Math.random() * 1000000);

  // Convert to a string and pad with zeros if necessary to ensure it's always 6 digits
  const sixDigitId: string = randomNumber.toString().padStart(6, "0");

  return sixDigitId;
}

export const getBase64MimeType = (encoded: string) => {
  let result = null;
  if (typeof encoded !== "string") {
    return result;
  }
  const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    result = mime[1];
  }
  return result;
};

export const getBase64Data = (encoded: string) => {
  const base64EncodedString = encoded.replace(/^data:\w+\/\w+;base64,/, "");
  return base64EncodedString;
};


export function streamUpload(
    fastify: FastifyInstance,
    file: Stream,
    public_id: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream: UploadStream = fastify.cloudinary.uploader.upload_stream({ public_id }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      });
  
      file.pipe(uploadStream).on('error', (err) => {
        uploadStream.destroy();
        reject(err);
      });
    });
  }

export function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}