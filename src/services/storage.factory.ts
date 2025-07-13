import { CloudinaryService } from './cloudinary.service';
import { ImageStorage } from './storage.interface';

let storageProvider: ImageStorage;

export function getStorageProvider(): ImageStorage {
  if (!storageProvider) {
    storageProvider = new CloudinaryService(); // en el futuro: switch dinámico
  }
  return storageProvider;
}
