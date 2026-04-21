"use client";

import Script from "next/script";
import * as React from "react";

const StripePricingTable = "stripe-pricing-table" as any;

export default function PricingPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>SUBSCRIBE NOW</h1>

      <Script
        async
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
      />

      <StripePricingTable
        pricing-table-id="prctbl_1TOh6201dSxu5ypyKDDs5A1O"
        publishable-key="pk_live_51RFpQK01dSxu5ypy7LPPn7z3sDNXglmULVZmTb2Ww2CJt9Ii8dVlhSYaOT8OZE5uvgLjjaNO83AVs1brvP8zU8kg007fGNeVnD"
      />
    </div>
  );
}