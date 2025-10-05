import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Mock payment verification - in production, you'd verify with the actual payment gateway
    // For now, we'll simulate a successful payment verification
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful payment data
    const mockPaymentData = {
      status: 'COMPLETED',
      fullname: 'Mock Customer',
      email: 'customer@example.com',
      amount: '0',
      transaction_id: transaction_id,
      trx_id: transaction_id,
      currency: 'USD',
      payment_method: 'MockPayment',
      meta_data: {
        orderId: 'ORD-' + Date.now().toString().slice(-8),
        customerPhone: '+1234567890',
        items: [],
        currency: 'USD',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: mockPaymentData,
      message: 'Payment verified successfully'
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
    message: 'Mock payment verification endpoint',
    usage: {
      method: 'POST',
      body: {
        transaction_id: 'string'
      }
    }
  });
}