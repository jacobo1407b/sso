// config/multer.ts
import multer from 'multer';

const storage = multer.memoryStorage(); // usa buffer para poder enviarlo a Cloudinary
export const upload = multer({ storage });
