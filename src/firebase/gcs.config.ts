import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  projectId: 'takes-two-to-fwango',
  credentials: JSON.parse(process.env.GCP_KEY),
});

export const gcsBucketName = 'takes-two-to-fwango.appspot.com';
export const bucket = storage.bucket(gcsBucketName);
