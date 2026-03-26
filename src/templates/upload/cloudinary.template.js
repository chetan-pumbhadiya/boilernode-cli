/** @format */

"use strict";

function cloudinaryTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  const config = isTS
    ? `import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
`
    : `import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
`;

  const middleware = isTS
    ? `import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.config';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  } as Record<string, unknown>,
});

export const uploadToCloudinary = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
`
    : `import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.config.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

export const uploadToCloudinary = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
`;

  return { config, middleware };
}

module.exports = { cloudinaryTemplate };
