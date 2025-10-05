export interface RupantorPayConfig {
  apiKey: string;
  baseUrl: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface PaymentRequest {
  fullname: string;
  email: string;
  amount: string;
  success_url: string;
  cancel_url: string;
  webhook_url?: string;
  meta_data?: Record<string, any>;
}

export interface PaymentResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

export interface VerifyRequest {
  transaction_id: string;
}

export interface VerifyResponse {
  status: string;
  fullname: string;
  email: string;
  amount: string;
  transaction_id: string;
  trx_id: string;
  currency: string;
  payment_method: string;
  meta_data?: Record<string, any>;
}

export interface PaymentCallbackParams {
  transactionID: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentFee: string;
  currency: string;
  status: string;
}

class RupantorPayService {
  private config: RupantorPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.RUPANTORPAY_API_KEY || '',
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://payment.rupantorpay.com' 
        : 'https://payment.rupantorpay.com', // Same URL for both
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/webhook`
    };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  getConfig(): RupantorPayConfig {
    return this.config;
  }

  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey,
          'X-CLIENT': process.env.NEXT_PUBLIC_HOST || 'localhost'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RupantorPay payment creation error:', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/payment/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey
        },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RupantorPay payment verification error:', error);
      throw error;
    }
  }

  formatAmount(amount: number): string {
    // Remove trailing zeros for whole numbers as per documentation
    return amount.toString();
  }
}

// Singleton instance
export const rupantorPayService = new RupantorPayService();
export default rupantorPayService;