// src/app/api/stripe/create-portal-session/route.ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
        return new NextResponse('User not found', { status: 404 });
    }

    const stripeCustomerId = user.publicMetadata.stripeCustomerId as
    | string
    | undefined;

    if (!stripeCustomerId) {
        return new NextResponse('No Stripe customer', { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
    });

    return NextResponse.json({ url: portal.url });
}
