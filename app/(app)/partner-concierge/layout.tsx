import type { Metadata } from "next";
import { partnerConciergeHubSchema } from "@/lib/site/partnerConciergeSchema";
import { absoluteSiteUrl } from "@/lib/site/siteUrl";

const description =
  "Professional gifting packages and chef-led private dining for real estate, medical, legal, builders, and sales teams across Roseburg and the Umpqua Valley.";

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
  const schema = partnerConciergeHubSchema(description);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      {children}
    </>
  );
}
