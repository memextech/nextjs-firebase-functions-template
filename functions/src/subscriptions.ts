/* eslint-disable camelcase */
import {CallableRequest, HttpsError, onCall, onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {logger} from "firebase-functions/v2";
import * as crypto from "crypto";
import * as admin from "firebase-admin";

const LEMON_SQUEEZY_API_KEY = defineSecret("LEMON_SQUEEZY_API_KEY");
const LEMON_SQUEEZY_SIGNING_SECRET = defineSecret("LEMON_SQUEEZY_SIGNING_SECRET");
const LEMON_SQUEEZY_STORE_ID = defineSecret("LEMON_SQUEEZY_STORE_ID");
const LEMON_SQUEEZY_VARIANT_ID = defineSecret("LEMON_SQUEEZY_VARIANT_ID");

export const LEMON_SQUEEZY = {
  BASE_URL: "https://api.lemonsqueezy.com/v1",
  apiHeaders: (apiKey: string) => ({
    "Accept": "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    "Authorization": `Bearer ${apiKey}`,
  }),
};

export const lemonSqueezyCreateCheckout = onCall(
  {secrets: [LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_VARIANT_ID]},
  async (request: CallableRequest) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const userEmail = request.auth.token.email;
    const userId = request.auth.uid;

    if (!userEmail) {
      throw new HttpsError(
        "failed-precondition",
        "User must have an email address."
      );
    }

    try {
      const checkoutUrl = await callCreateCheckoutApi(
        LEMON_SQUEEZY_API_KEY.value(),
        LEMON_SQUEEZY_STORE_ID.value(),
        LEMON_SQUEEZY_VARIANT_ID.value(),
        userEmail,
        userId
      );

      logger.info("Checkout url", {checkoutUrl});

      return {
        success: true,
        data: {
          checkoutUrl: checkoutUrl,
        },
      };
    } catch (error) {
      logger.error("Error creating checkout session", error);
      throw new HttpsError("internal", "Failed to create checkout session");
    }
  }
);

export const lemonSqueezyHandleWebhooks = onRequest(
  {
    secrets: [LEMON_SQUEEZY_SIGNING_SECRET],
  },
  async (req, res) => {
    try {
      const isValid = verifyLemonSqueezySignature(req);
      if (!isValid) {
        res.status(403).send("Unauthorized");
        return;
      }

      const eventName: string = req.body.meta.event_name;
      const userEmail: string = req.body.meta.custom_data.user_email;

      switch (eventName) {
      case "subscription_created": {
        logger.info("Subscription created");
        await addClaim(userEmail);
        break;
      }
      case "subscription_expired": {
        logger.info("Subscription expired");
        await removeClaim(userEmail);
        break;
      }
      default: {
        logger.error(`Unhandled event type: ${eventName}`);
        res.status(400).send("Event not handled");
        return;
      }
      }

      res.status(200).send("Event processed");
      return;
    } catch (error) {
      logger.error("Error processing webhook:", error);
      throw new HttpsError("internal", "Error processing webhook");
    }
  }
);

async function callCreateCheckoutApi(apiKey: string, storeId: string, variantId: string, userEmail: string, userId: string) {
  try {
    logger.info("Creating checkout", {userEmail, userId});

    const response = await fetch(
      `${LEMON_SQUEEZY.BASE_URL}/checkouts`,
      {
        method: "POST",
        headers: LEMON_SQUEEZY.apiHeaders(apiKey),
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              custom_price: null,
              product_options: {
                enabled_variants: [variantId],
              },
              checkout_options: {
                "embed": true,
              },
              checkout_data: {
                userEmail,
                custom: {
                  user_id: userId,
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantId,
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    logger.error("Error creating checkout", error);
    throw new HttpsError("internal", "Failed to create checkout");
  }
}

async function addClaim(userEmail: string) {
  logger.info("Adding claim");
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(userEmail);
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      demo_subscription: true,
    });

    return {
      success: true,
      message: `Success! ${userEmail} subscription added`,
    };
  } catch (error) {
    logger.error(`Error adding admin role: ${error}`);
    throw new Error("Error adding admin role");
  }
}

async function removeClaim(userEmail: string) {
  logger.info("Removing claim");
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(userEmail);
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      demo_subscription: false,
    });

    return {
      success: true,
      message: `Success! ${userEmail} subscription removed`,
    };
  } catch (error) {
    logger.error(`Error adding admin role: ${error}`);
    throw new Error("Error adding admin role");
  }
}

function verifyLemonSqueezySignature(req: any): boolean {
  const secret = LEMON_SQUEEZY_SIGNING_SECRET.value();
  const signature = req.headers["x-signature"];
  const digest = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
