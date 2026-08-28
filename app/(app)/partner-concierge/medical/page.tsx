import { notFound } from "next/navigation";
import IndustryLandingPage from "@/components/partner-concierge/IndustryLandingPage";
import {
  getPartnerIndustry,
  partnerIndustryMetadata,
} from "@/lib/site/partnerConciergeIndustries";

const SLUG = "medical" as const;

export const metadata = partnerIndustryMetadata(SLUG);

export default function MedicalPartnerPage() {
  const industry = getPartnerIndustry(SLUG);
  if (!industry) notFound();
  return <IndustryLandingPage industry={industry} />;
}
