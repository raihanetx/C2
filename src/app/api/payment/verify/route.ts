import { NextRequest, NextResponse } from 'next/server';
import rupantorPayService from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    // Validate required field
    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Missing required field: transaction_id' },
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

    // Verify payment with RupantorPay
    const verificationResponse = await rupantorPayService.verifyPayment(transaction_id);

    return NextResponse.json({
      success: true,
      data: verificationResponse
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RupantorPay payment verification endpoint',
    configured: rupantorPayService.isConfigured(),
    usage: {
      method: 'POST',
      body: {
        transaction_id: 'string'
      }
    }
  });
}