import { NextResponse } from 'next/server';

export const runtime = 'edge';

const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes replay window

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifyStandardWebhookSignature({ rawBody, headers, secret }) {
  const webhookId = headers.get('webhook-id');
  const webhookTimestamp = headers.get('webhook-timestamp');
  const webhookSignature = headers.get('webhook-signature');

  if (!webhookId || !webhookTimestamp || !webhookSignature || !secret) {
    return false;
  }

  const timestampSeconds = Number(webhookTimestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS) {
    return false;
  }

  // Standard Webhooks secrets start with "whsec_" followed by base64 key material
  const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const keyBytes = base64ToUint8Array(cleanSecret);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedContent = new TextEncoder().encode(
    `${webhookId}.${webhookTimestamp}.${rawBody}`
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, signedContent);
  const expectedSig = uint8ArrayToBase64(new Uint8Array(signatureBuffer));

  // Header can contain multiple space-delimited signatures like "v1,<sig1> v1,<sig2>"
  const candidates = webhookSignature.split(' ');
  for (const entry of candidates) {
    const [version, sig] = entry.split(',');
    if (version === 'v1' && sig && timingSafeEqual(sig, expectedSig)) {
      return true;
    }
  }

  return false;
}

export async function POST(req) {
  try {
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured.' },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const isValid = await verifyStandardWebhookSignature({
      rawBody,
      headers: req.headers,
      secret: webhookSecret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.type;
    const paymentId = event?.data?.payment_id || event?.data?.id || 'unknown';

    if (eventType === 'payment.succeeded') {
      console.log(`Dodo payment confirmed via webhook: ${paymentId}`);
    } else if (eventType === 'payment.failed') {
      console.warn(`Dodo payment failed via webhook: ${paymentId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error.' },
      { status: 400 }
    );
  }
}
