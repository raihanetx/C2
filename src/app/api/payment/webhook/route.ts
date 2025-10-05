import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock webhook handler - in production, you'd handle real payment gateway webhooks
    console.log('Mock webhook received:', body);
    
    // Simulate processing webhook
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      message: 'Mock webhook processed successfully'
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mock payment webhook endpoint',
    configured: true,
    note: 'This is a mock webhook handler for development/testing'
  });
}