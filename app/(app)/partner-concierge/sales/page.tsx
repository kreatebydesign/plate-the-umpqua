import { notFound } from "next/navigation";
import IndustryLandingPage from "@/components/partner-concierge/IndustryLandingPage";
import {
  getPartnerIndustry,
  partnerIndustryMetadata,
} from "@/lib/site/partnerConciergeIndustries";

const SLUG = "sales" as const;

export const metadata = partnerIndustryMetadata(SLUG);

export default function SalesPartnerPage() {
  const industry = getPartnerIndustry(SLUG);
  if (!industry) notFound();
  return <IndustryLandingPage industry={industry} />;
}
