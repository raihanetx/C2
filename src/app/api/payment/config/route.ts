import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Mock payment configuration endpoint',
    configured: true,
    provider: 'Mock Payment System',
    features: {
      createPayment: true,
      verifyPayment: true,
      webhook: false
    },
    note: 'This is a mock payment system for development/testing. Replace with real payment gateway in production.'
  });
}