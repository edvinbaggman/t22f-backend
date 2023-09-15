import { Controller, Get, UseGuards } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('test1ctrl')
export class Test1ctrlController {
  private readonly firestore = admin.firestore();

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async findAll() {
    const document = this.firestore.collection('users').doc('test@test.se');
    const docData = await document.get();
    if (docData.exists) {
      return docData.data();
    } else {
      return 'NO DATA';
    }
  }
}
