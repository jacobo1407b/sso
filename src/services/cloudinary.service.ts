import { v2 as cloudinary } from 'cloudinary';
import { ImageStorage } from './storage.interface';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export class CloudinaryService implements ImageStorage {

    async uploadImage(file: Buffer, options = {}): Promise<{ publicId: string; url: string }> {
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(file);
        });
        return {
            publicId: result.public_id,
            url: result.secure_url,
        };
    }

    async deleteImage(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }

    getImageUrl(publicId: string): string {
        return cloudinary.url(publicId, { secure: true });
    }
}
