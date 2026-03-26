/** @format */

"use strict";

function s3Template(cfg) {
  const isTS = cfg.language === "typescript";

  const config = isTS
    ? `import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.config';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
`
    : `import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.config.js';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
`;

  const middleware = isTS
    ? `import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../config/s3.config';
import { env } from '../config/env.config';
import path from 'path';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = \`uploads/\${Date.now()}-\${Math.round(Math.random() * 1e9)}\${ext}\`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(\`Unsupported file type: \${file.mimetype}\`));
  },
});
`
    : `import multer from 'multer';
import multerS3 from 'multer-s3';
import { extname } from 'path';
import { s3Client } from '../config/s3.config.js';
import { env } from '../config/env.config.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_req, file, cb) => {
      const ext = extname(file.originalname);
      cb(null, \`uploads/\${Date.now()}-\${Math.round(Math.random() * 1e9)}\${ext}\`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(\`Unsupported file type: \${file.mimetype}\`));
  },
});
`;

  return { config, middleware };
}

module.exports = { s3Template };
