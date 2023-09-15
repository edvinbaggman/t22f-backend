import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Module({})
export class FirebaseModule {
  constructor() {
    (async () => {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(process.env.FIRESTORE_KEY),
          ),
        });
      }
    })();
  }
}
