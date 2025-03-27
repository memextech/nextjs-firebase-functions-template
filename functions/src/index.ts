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

// Define secrets
const demoSecretKey = defineSecret("DEMO_SECRET_KEY");

// Initialize Firebase App
initializeApp();

export const getProduct = functions.https.onCall(
  {secrets: [demoSecretKey]},
  async (request: CallableRequest<void>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Only authenticated users can call this function."
      );
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    const secretKey = demoSecretKey.value();

    console.log("userId", userId);
    console.log("userEmail", userEmail);
    console.log("demoSecretKey", demoSecretKey.value());

    try {
      const db = getFirestore();
      const product = (await db.collection("products").doc("laptop").get()).data();

      console.log("product.name", product?.name);
      console.log("product.price", product?.price);

      return {
        success: true,
        data: {
          userId: userId,
          userEmail: userEmail,
          secretKey: secretKey,
          product: product,
        },
      };
    } catch (error) {
      logger.error("Failed to get product", error);
      throw new HttpsError("internal", "Failed to get product");
    }
  }
);

