import { writeFileSync } from "fs";
import crypto from "crypto";
import path from "path";
import { ImageStorage } from './storage.interface';


const mainPath = 'D:/sso'

export class FileSystemService implements ImageStorage {
    async uploadImage(file: Buffer, options?: Record<string, any>): Promise<{ publicId: string; url: string; }> {
        const randomString = options?.public_id ?? (crypto.randomBytes(15).toString('base64').slice(0, 20) + '.jpg');
        await writeFileSync(path.join(mainPath, randomString), file)
        return {
            publicId: randomString,
            url: path.join(mainPath, randomString)
        }
    }

    async deleteImage(publicId: string): Promise<void> {

    }
    getImageUrl(publicId: string): string {
        const ruta = path.join(mainPath, publicId);
        return ruta;
    }
}