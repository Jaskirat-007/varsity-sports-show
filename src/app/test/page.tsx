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
        pricing-table-id="prctbl_1TOi5301dSxu5ypyEefa6DDD"
        publishable-key="pk_test_51RFpQK01dSxu5ypyWzBJ97UpiMoPMxEXyCKhSW7yGcci9MLJxIFZnRwrCl43ZhLoEKxNiOwCJbIR6EuW4EW5th2000b3JTuTCQ"
      />
    </div>
  );
}