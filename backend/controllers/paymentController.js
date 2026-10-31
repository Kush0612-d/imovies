import crypto from 'crypto';

// @desc    Create Razorpay or Mock Order
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live/test Razorpay keys are configured, attempt Razorpay order creation
    if (razorpayKeyId && razorpaySecret) {
      try {
        const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`
          })
        });

        if (response.ok) {
          const orderData = await response.json();
          return res.json({
            success: true,
            mode: 'razorpay',
            keyId: razorpayKeyId,
            order: orderData
          });
        }
      } catch (err) {
        console.warn('[Razorpay Order Creation Failed, switching to Mock Mode]:', err.message);
      }
    }

    // Default: Mock Payment Gateway Order (Academic & Development mode)
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    res.json({
      success: true,
      mode: 'mock',
      message: 'IMovies Secure Mock Payment Sandbox Gateway (Test Mode)',
      order: {
        id: mockOrderId,
        entity: 'order',
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { mode, orderId, paymentId, signature } = req.body;

    // Live Razorpay Verification
    if (mode === 'razorpay') {
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpaySecret) {
        return res.status(400).json({ success: false, message: 'Razorpay secret not configured on server' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ success: false, verified: false, message: 'Payment verification failed: Invalid cryptographic signature' });
      }

      return res.json({
        success: true,
        verified: true,
        message: 'Razorpay payment verified successfully',
        transactionId: paymentId
      });
    }

    // Secure Mock Verification
    if (mode === 'mock' || !mode) {
      if (!orderId || !paymentId) {
        return res.status(400).json({ success: false, message: 'Payment verification requires orderId and paymentId' });
      }

      return res.json({
        success: true,
        verified: true,
        message: 'Mock Payment processed and verified successfully by IMovies Gateway',
        transactionId: paymentId || `TXN-MOCK-${Date.now()}`
      });
    }

    res.status(400).json({ success: false, message: 'Unknown payment mode' });
  } catch (error) {
    next(error);
  }
};

