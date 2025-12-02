"use client";

import Script from "next/script";
import * as React from "react";

const StripePricingTable = "stripe-pricing-table" as any;

export default function PricingPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Stripe Sandbox Price Table</h1>

      <Script
        async
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
      />

      <StripePricingTable
        pricing-table-id="prctbl_1SXGoW03A6rG1wdvAtRct7Pa"
        publishable-key="pk_test_51RFpQX03A6rG1wdvs2erdWhY6SsDuN2On5wOXqpMjFNtQHDsNla5cbFy6TxpS90Cb0KKTwG7bNz6MMRAXxdxOIIA00zLkBq87v"
      />
    </div>
  );
}
