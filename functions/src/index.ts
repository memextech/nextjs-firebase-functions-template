/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from "firebase-functions/v2";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {HttpsError, CallableRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp} from "firebase-admin/app";
import {v4 as uuidv4} from "uuid";

// Define secrets
const demoSecretKey = defineSecret("DEMO_SECRET_KEY");

// Initialize Firebase App
initializeApp();

interface Product {
  id: string;
  name: string;
  price: number;
  createdBy: string;
  createdAt: Date;
}

interface CreateProductRequest {
  name: string;
  price: number;
}

export const createProduct = functions.https.onCall(
  {secrets: [demoSecretKey]},
  async (request: CallableRequest<CreateProductRequest>) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Only authenticated users can call this function.");
    }

    const userEmail = request.auth.token.email;

    const {name, price} = request.data;

    const product: Product = {
      id: uuidv4(),
      name: name,
      price: price,
      createdBy: userEmail || "unknown",
      createdAt: new Date(),
    };

    logger.info("creating product", product);

    try {
      const db = getFirestore();
      await db.collection("products").doc(name).set(product);

      return {
        success: true,
        data: {
          product: product,
        },
      };
    } catch (error) {
      logger.error("Failed to create product", error);
      throw new HttpsError("internal", "Failed to create product");
    }
  }
);
