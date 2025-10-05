import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook signature verification (if RupantorPay supports it)
const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-rupantorpay-signature') || '';
    
    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Invalid webhook JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Log webhook for debugging
    console.log('RupantorPay Webhook received:', webhookData);

    // Extract payment information
    const {
      transaction_id,
      status,
      amount,
      currency,
      payment_method,
      fullname,
      email,
      meta_data
    } = webhookData;

    // Validate required fields
    if (!transaction_id || !status) {
      console.error('Missing required webhook fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process payment based on status
    if (status === 'COMPLETED') {
      await handleSuccessfulPayment(webhookData);
    } else if (status === 'FAILED' || status === 'ERROR') {
      await handleFailedPayment(webhookData);
    } else if (status === 'PENDING') {
      await handlePendingPayment(webhookData);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentData: any) {
  try {
    const { transaction_id, meta_data } = paymentData;
    const orderId = meta_data?.orderId;

    if (!orderId) {
      console.error('No order ID found in webhook metadata');
      return;
    }

    // Update order status in localStorage (in production, use database)
    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const orderIndex = existingOrders.findIndex((order: any) => order.id === orderId);

    if (orderIndex !== -1) {
      existingOrders[orderIndex].status = 'completed';
      existingOrders[orderIndex].paymentDetails = {
        transactionId: transaction_id,
        paymentMethod: paymentData.payment_method,
        paidAmount: paymentData.amount,
        currency: paymentData.currency,
        completedAt: new Date().toISOString()
      };

      // Save updated order
      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
      console.log(`Order ${orderId} marked as completed via webhook`);
    }

    // Send confirmation email (if not already sent)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'purchase_confirmation',
          data: {
            customerName: paymentData.fullname,
            customerEmail: paymentData.email,
            orderNumber: orderId,
            items: meta_data?.items || [],
            totalAmount: paymentData.amount,
            currency: paymentData.currency,
            contactInfo: {
              phone: meta_data?.customerPhone || '',
              whatsapp: '',
              email: ''
            }
          }
        })
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email from webhook:', emailError);
    }

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentData: any) {
  try {
    const { transaction_id, meta_data } = paymentData;
    const orderId = meta_data?.orderId;

    if (!orderId) {
      console.error('No order ID found in webhook metadata');
      return;
    }

    // Update order status to failed
    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const orderIndex = existingOrders.findIndex((order: any) => order.id === orderId);

    if (orderIndex !== -1) {
      existingOrders[orderIndex].status = 'failed';
      existingOrders[orderIndex].paymentDetails = {
        transactionId: transaction_id,
        paymentMethod: paymentData.payment_method,
        failedAt: new Date().toISOString(),
        failureReason: paymentData.failure_reason || 'Payment failed'
      };

      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
      console.log(`Order ${orderId} marked as failed via webhook`);
    }

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handlePendingPayment(paymentData: any) {
  try {
    const { transaction_id, meta_data } = paymentData;
    const orderId = meta_data?.orderId;

    if (!orderId) {
      console.error('No order ID found in webhook metadata');
      return;
    }

    // Update order status to pending
    const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const orderIndex = existingOrders.findIndex((order: any) => order.id === orderId);

    if (orderIndex !== -1) {
      existingOrders[orderIndex].status = 'pending';
      existingOrders[orderIndex].paymentDetails = {
        transactionId: transaction_id,
        paymentMethod: paymentData.payment_method,
        pendingAt: new Date().toISOString()
      };

      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
      console.log(`Order ${orderId} marked as pending via webhook`);
    }

  } catch (error) {
    console.error('Error handling pending payment:', error);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RupantorPay webhook endpoint',
    status: 'active',
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rupantorpay-signature': 'optional-signature-header'
      },
      body: {
        transaction_id: 'string',
        status: 'COMPLETED|FAILED|PENDING',
        amount: 'string',
        currency: 'string',
        payment_method: 'string',
        fullname: 'string',
        email: 'string',
        meta_data: {
          orderId: 'string',
          items: 'array'
        }
      }
    }
  });
}