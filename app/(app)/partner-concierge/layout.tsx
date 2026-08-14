import type { Metadata } from "next";
import {
  EXPERIENCE_TIERS,
  PREPAID_PARTNER_PACKAGES,
} from "@/lib/site/partnerConciergePricing";

const description =
  "Partner Concierge prepaid packages and chef-led private dining for realtors, advisors, medical practices, attorneys, and executive teams across Roseburg and the Umpqua Valley.";

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
          url: "https://platetheumpqua.com",
        },
      },
    })),
    ...PREPAID_PARTNER_PACKAGES.map((pkg, index) => ({
      "@type": "ListItem",
      position: EXPERIENCE_TIERS.length + index + 1,
      item: {
        "@type": "Offer",
        name: `${pkg.title} — ${pkg.tableCount}-table partner package`,
        description: pkg.desc,
        price: String(pkg.priceCents / 100),
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
        seller: {
          "@type": "FoodEstablishment",
          name: "Plate The Umpqua",
          url: "https://platetheumpqua.com",
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
    url: "https://platetheumpqua.com/partner-concierge",
  },
  alternates: {
    canonical: "https://platetheumpqua.com/partner-concierge",
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
