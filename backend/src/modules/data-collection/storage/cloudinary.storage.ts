import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import type { IImageStorage, ImageSaveMetadata } from "./image.storage";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export class CloudinaryImageStorage implements IImageStorage {
  async save(buffer: Buffer, meta: ImageSaveMetadata): Promise<string> {
    const publicId = `fashion-trend/${meta.source}/${meta.externalId}`;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          unique_filename: false,
          resource_type: "image",
          format: "webp",
          quality: "auto:good",
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error ?? new Error("Cloudinary upload returned no result"),
            );
          }
          resolve(result.secure_url);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }
}
