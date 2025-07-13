export interface ImageStorage {
  uploadImage(file: Buffer, options?: Record<string, any>): Promise<{ publicId: string; url: string }>;
  deleteImage(publicId: string): Promise<void>;
  getImageUrl(publicId: string): string;
}
