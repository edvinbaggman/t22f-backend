import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({})
export class FirebaseModule {
  constructor() {
    (async () => {
      const serviceAccount = await import('./key.json') as admin.ServiceAccount;
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    })();
  }
}
