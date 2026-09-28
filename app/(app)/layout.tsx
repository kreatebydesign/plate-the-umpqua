import type { Metadata, Viewport } from "next";
import GoogleAnalytics from "./components/GoogleAnalytics";
import SiteShell from "./components/SiteShell";
import { siteBusinessSchema } from "@/lib/site/servicePageSchema";
import { SITE_ORIGIN } from "@/lib/site/siteUrl";
import "./globals.css";

const siteDescription =
  "Chef-led private dining, private events, elevated catering, and wine country hospitality rooted in Roseburg and the Umpqua Valley.";

const businessSchema = siteBusinessSchema(siteDescription);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),

  title: {
    default: "Plate The Umpqua | Private Chef Hospitality in Roseburg, Oregon",
    template: "%s | Plate The Umpqua",
  },

  description: siteDescription,

  keywords: [
    "Plate The Umpqua",
    "Roseburg private chef",
    "private chef Roseburg Oregon",
    "Umpqua Valley private dining",
    "Southern Oregon private chef",
    "Roseburg private dining",
    "Umpqua Valley hospitality",
    "estate dinners Oregon",
    "wine country private dining",
    "luxury private dining Oregon",
    "realtor concierge dinner",
    "closing gift dinner",
    "retreat hospitality Oregon",
    "executive hospitality Southern Oregon",
    "private events Roseburg Oregon",
    "catering Roseburg Oregon",
    "private catering Roseburg",
  ],

  authors: [{ name: "Plate The Umpqua" }],
  creator: "Plate The Umpqua",
  publisher: "Plate The Umpqua",

  verification: {
    google: "PAvYzjqSDb7uh9SushEgxm9FgFwhwq2r",
  },

  openGraph: {
    title: "Plate The Umpqua | Private Chef Hospitality in Roseburg, Oregon",
    description:
      "Private chef dining, private events, estate gatherings, and wine country hospitality across Roseburg, the Umpqua Valley, and Southern Oregon.",
    url: SITE_ORIGIN,
    siteName: "Plate The Umpqua",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Plate The Umpqua private hospitality in Roseburg and the Umpqua Valley",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Plate The Umpqua | Private Chef Hospitality in Roseburg, Oregon",
    description:
      "Chef-led private dining, private events, and elevated hospitality experiences rooted in Roseburg and the Umpqua Valley.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "Hospitality",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14120e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#14120e] text-[#efe6d4] antialiased">
        <GoogleAnalytics />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessSchema),
          }}
        />

        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}