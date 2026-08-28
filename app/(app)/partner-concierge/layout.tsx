import type { Metadata } from "next";
import {
  EXPERIENCE_TIERS,
  PREPAID_PARTNER_PACKAGES,
} from "@/lib/site/partnerConciergePricing";
import { absoluteSiteUrl, SITE_ORIGIN } from "@/lib/site/siteUrl";

const description =
  "Professional gifting packages and chef-led private dining for real estate, medical, legal, builders, and sales teams across Roseburg and the Umpqua Valley.";

const partnerOffersSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Plate The Umpqua Partner Concierge Packages",
  description,
  itemListElement: [
    ...EXPERIENCE_TIERS.map((tier, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: tier.title,
        description: tier.desc,
        provider: {
          "@type": "FoodEstablishment",
          name: "Plate The Umpqua",
          url: SITE_ORIGIN,
        },
      },
    })),
    ...PREPAID_PARTNER_PACKAGES.map((pkg, index) => ({
      "@type": "ListItem",
      position: EXPERIENCE_TIERS.length + index + 1,
      item: {
        "@type": "Offer",
        name: `${pkg.title}${pkg.tableCount > 1 ? ` — ${pkg.tableCount}-experience pack` : ""}`,
        description: pkg.desc,
        price: String(pkg.priceCents / 100),
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
        seller: {
          "@type": "FoodEstablishment",
          name: "Plate The Umpqua",
          url: SITE_ORIGIN,
        },
      },
    })),
  ],
};

export const metadata: Metadata = {
  title: "Partner Concierge Program",
  description,
  openGraph: {
    title: "Partner Concierge Program | Plate The Umpqua",
    description,
    url: absoluteSiteUrl("/partner-concierge"),
  },
  alternates: {
    canonical: absoluteSiteUrl("/partner-concierge"),
  },
};

export default function PartnerConciergeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(partnerOffersSchema),
        }}
      />
      {children}
    </>
  );
}
