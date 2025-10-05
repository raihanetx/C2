import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService, { PaymentRequest } from '@/lib/rupantorpay';
import { mockProducts } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone,
      items, 
      totalAmount, 
      currency,
      orderId 
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !totalAmount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, totalAmount, items' },
        { status: 400 }
      );
    }

    // Check if RupantorPay is configured
    if (!rupantorPayService.isConfigured()) {
      return NextResponse.json(
        { error: 'RupantorPay payment service not configured' },
        { status: 503 }
      );
    }

    // Prepare payment data
    const paymentData: PaymentRequest = {
      fullname: customerName,
      email: customerEmail,
      amount: rupantorPayService.formatAmount(totalAmount),
      success_url: rupantorPayService.getConfig().successUrl,
      cancel_url: rupantorPayService.getConfig().cancelUrl,
      webhook_url: rupantorPayService.getConfig().webhookUrl,
      meta_data: {
        orderId,
        customerPhone,
        items: items.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          duration: item.duration
        })),
        currency,
        timestamp: new Date().toISOString()
      }
    };

    // Create payment with RupantorPay
    const paymentResponse = await rupantorPayService.createPayment(paymentData);

    if (paymentResponse.status && paymentResponse.payment_url) {
      return NextResponse.json({
        success: true,
        payment_url: paymentResponse.payment_url,
        message: 'Payment URL generated successfully'
      });
    } else {
      return NextResponse.json(
        { error: paymentResponse.message || 'Failed to create payment' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RupantorPay payment creation endpoint',
    configured: rupantorPayService.isConfigured(),
    usage: {
      method: 'POST',
      body: {
        customerName: 'string',
        customerEmail: 'string',
        customerPhone: 'string',
        items: [{
          productId: 'string',
          name: 'string',
          quantity: 'number',
          price: 'number',
          duration: 'string'
        }],
        totalAmount: 'number',
        currency: 'string',
        orderId: 'string'
      }
    }
  });
}