import { Controller, Get, UseGuards } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('test1ctrl')
export class Test1ctrlController {
  private readonly firestore = admin.firestore();

  private async replaceReferencesWithContent(data: any, fetchedPaths: Set<string> = new Set()): Promise<any> {
    if (data instanceof admin.firestore.DocumentReference) {
      const referencePath = data.path;

      if (fetchedPaths.has(referencePath)) {
        console.warn('Circular reference detected:', referencePath);
        return `reference:${referencePath}`; // Return the reference string as-is
      }

      fetchedPaths.add(referencePath);

      const referenceDoc = await data.get();
      if (referenceDoc.exists) {
        const referenceData = referenceDoc.data();
        return await this.replaceReferencesWithContent(referenceData, fetchedPaths);
      } else {
        console.log('Reference points to a non-existent document:', referencePath);
        return null;
      }
    }

    if (Array.isArray(data)) {
      const updatedArray = await Promise.all(
        data.map(item => this.replaceReferencesWithContent(item, fetchedPaths))
      );
      return updatedArray;
    } else if (typeof data === 'object' && data !== null) {
      const updatedObject = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          updatedObject[key] = await this.replaceReferencesWithContent(data[key], fetchedPaths);
        }
      }
      return updatedObject;
    }
    return data;
  }

  @Get()
  async findAll() {
    const document = this.firestore.doc('users/test@test.se');
    //const document = this.firestore.collection('players').doc('3');
    const docData = await document.get();
    if (docData.exists) {
      const updatedDocData = await this.replaceReferencesWithContent(
        docData.data(),
      );
      return updatedDocData;
    } else {
      return 'NO DATA';
    }
  }
}
