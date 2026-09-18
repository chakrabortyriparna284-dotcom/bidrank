import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { StripePaymentAdapter } from "./lib/payments/stripe";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

const stripeWebhook = httpAction(async (ctx, request) => {
  const adapter = new StripePaymentAdapter();
  const event = await adapter.verifyAndNormalizeWebhook(request);

  if (!event) {
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (event.status === "succeeded") {
    await ctx.runMutation(internal.payments.fulfillPayment, {
      provider: event.provider,
      providerPaymentId: event.providerPaymentId,
      productId: event.productId as any,
      userId: event.userId as any,
      amountPaidInCents: event.amountPaid,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
