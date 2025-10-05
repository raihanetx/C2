import { NextResponse } from 'next/server';
import rupantorPayService from '@/lib/rupantorpay';

export async function GET() {
  return NextResponse.json({
    service: 'RupantorPay',
    configured: rupantorPayService.isConfigured(),
    config: {
      apiKey: {
        required: true,
        description: 'API key from RupantorPay Brands section',
        status: rupantorPayService.isConfigured() ? 'configured' : 'missing'
      },
      endpoints: {
        create_payment: '/api/payment/create',
        verify_payment: '/api/payment/verify',
        webhook: '/api/payment/webhook',
        success_url: '/payment/success',
        cancel_url: '/payment/cancel'
      },
      supported_methods: [
        'bKash',
        'Nagad', 
        'Rocket',
        'Credit/Debit Cards',
        'Mobile Banking'
      ]
    },
    setup_instructions: {
      step1: 'Get API key from RupantorPay Brands section',
      step2: 'Add RUPANTORPAY_API_KEY to your .env file',
      step3: 'Configure webhook URL in RupantorPay dashboard',
      step4: 'Test with sandbox credentials first'
    },
    test_mode: {
      enabled: true,
      note: 'RupantorPay uses same URL for both sandbox and live'
    }
  });
}