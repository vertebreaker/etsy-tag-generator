import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId = process.env.DODO_PRODUCT_ID;
    const environment =
      process.env.NEXT_PUBLIC_DODO_MODE === 'live' ? 'live_mode' : 'test_mode';

    if (!apiKey || !productId) {
      return NextResponse.json(
        { error: 'Payment gateway configuration is missing on server.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const productTitle = typeof body.productTitle === 'string'
      ? body.productTitle.slice(0, 140).trim()
      : 'Etsy Listing Rewrite';

    // Validate safe internal returnPath to prevent open-redirect abuse
    const rawReturnPath = typeof body.returnPath === 'string' ? body.returnPath : '/';
    const safeReturnPath =
      rawReturnPath.startsWith('/') && !rawReturnPath.startsWith('//')
        ? rawReturnPath
        : '/';

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://etsy-tag-generator.pages.dev';

    const client = new DodoPayments({
      bearerToken: apiKey,
      environment,
    });

    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: `${siteUrl}${safeReturnPath}`,
      metadata: {
        product_title: productTitle,
        service: 'etsy_full_listing_rewrite',
      },
    });

    if (!session?.checkout_url) {
      return NextResponse.json(
        { error: 'Failed to initialize checkout session.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error) {
    console.error('Dodo checkout session error:', error);
    return NextResponse.json(
      { error: 'Unable to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
