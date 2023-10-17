import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_PATH });

console.log('Process ' + process.env);
console.log('SSSS  Process GCP key : ' + process.env.GCP_KEY);

const storage = new Storage({
  projectId: 'takes-two-to-fwango',
  credentials: JSON.parse(process.env.GCP_KEY),
});

export const gcsBucketName = 'takes-two-to-fwango.appspot.com';
export const bucket = storage.bucket(gcsBucketName);
