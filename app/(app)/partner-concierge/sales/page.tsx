import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndustryLandingPage from "@/components/partner-concierge/IndustryLandingPage";
import { getPartnerIndustry } from "@/lib/site/partnerConciergeIndustries";

const SLUG = "sales" as const;

export const metadata: Metadata = (() => {
  const industry = getPartnerIndustry(SLUG)!;
  return {
    title: industry.seo.title,
    description: industry.seo.description,
    openGraph: {
      title: `${industry.seo.title} | Plate The Umpqua`,
      description: industry.seo.description,
      url: `https://platetheumpqua.com${industry.href}`,
    },
    alternates: {
      canonical: `https://platetheumpqua.com${industry.href}`,
    },
  };
})();

export default function SalesPartnerPage() {
  const industry = getPartnerIndustry(SLUG);
  if (!industry) notFound();
  return <IndustryLandingPage industry={industry} />;
}
