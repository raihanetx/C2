import { NextRequest, NextResponse } from 'next/server';

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

    // Simulate payment processing - in production, you'd integrate with a real payment gateway
    // For now, we'll create a mock payment flow
    
    // Generate a mock transaction ID
    const transactionId = 'TXN-' + Date.now().toString().slice(-8);
    
    // Create a mock payment URL (in production, this would be a real payment gateway)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/payment/success?transactionID=${transactionId}&paymentMethod=MockPayment&paymentAmount=${totalAmount}&paymentFee=0&currency=${currency}&status=COMPLETED`;

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      transaction_id: transactionId,
      message: 'Payment URL generated successfully'
    });

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
    message: 'Mock payment creation endpoint',
    configured: true,
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