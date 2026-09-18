export interface CreateCheckoutParams {
  userId: string;
  productId: string;
  productName: string;
  newBid: number; // in dollars
  amountDue: number; // in cents
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export interface NormalizedPaymentEvent {
  provider: "stripe" | "dodo";
  providerPaymentId: string;
  productId: string;
  userId: string;
  amountPaid: number; // in cents
  currency: string;
  status: "succeeded" | "failed";
}

export interface PaymentProviderAdapter {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyAndNormalizeWebhook(request: Request): Promise<NormalizedPaymentEvent | null>;
}
