import Stripe from "stripe";
import {
  CheckoutResult,
  CreateCheckoutParams,
  NormalizedPaymentEvent,
  PaymentProviderAdapter,
} from "./types";

export class StripePaymentAdapter implements PaymentProviderAdapter {
  private stripe: Stripe | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.STRIPE_SECRET_KEY;
    if (key && key !== "sk_test_placeholder") {
      this.stripe = new Stripe(key, {
        apiVersion: "2025-02-24.acacia" as any,
      });
    }
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    if (!this.stripe) {
      // In local dev without live Stripe key, return a mock redirect URL with payment success simulation
      return {
        checkoutUrl: `${params.successUrl}&mockSession=mock_${Date.now()}`,
        sessionId: `mock_session_${Date.now()}`,
      };
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Bid for ${params.productName}`,
              description: `Increase bid to $${params.newBid} on BidRank`,
            },
            unit_amount: params.amountDue,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        productId: params.productId,
        newBid: params.newBid.toString(),
      },
    });

    return {
      checkoutUrl: session.url || "",
      sessionId: session.id,
    };
  }

  async verifyAndNormalizeWebhook(request: Request): Promise<NormalizedPaymentEvent | null> {
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret || !this.stripe) {
      return null;
    }

    const payload = await request.text();
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook verification error:", err);
      return null;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const productId = session.metadata?.productId;
      const userId = session.metadata?.userId;
      const amountPaid = session.amount_total || 0;

      if (!productId || !userId) {
        return null;
      }

      return {
        provider: "stripe",
        providerPaymentId: session.id,
        productId,
        userId,
        amountPaid,
        currency: session.currency || "usd",
        status: "succeeded",
      };
    }

    return null;
  }
}
