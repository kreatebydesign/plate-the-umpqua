import type { Metadata, Viewport } from "next";
import GoogleAnalytics from "./components/GoogleAnalytics";
import SiteShell from "./components/SiteShell";
import "./globals.css";

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Plate The Umpqua",
  url: "https://platetheumpqua.com",
  description:
    "Chef-led private dining, estate dinners, realtor concierge hospitality, and wine country experiences rooted in Roseburg and the Umpqua Valley.",
  areaServed: ["Roseburg, Oregon", "Umpqua Valley", "Southern Oregon"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Roseburg",
    addressRegion: "OR",
    addressCountry: "US",
  },
  servesCuisine: [
    "Private Dining",
    "Seasonal Hospitality",
    "Wine Country Dining",
  ],
  priceRange: "$$$",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://platetheumpqua.com"),

  title: {
    default: "Plate The Umpqua | Private Hospitality in Roseburg, Oregon",
    template: "%s | Plate The Umpqua",
  },

  description:
    "Chef-led private dining, estate dinners, realtor concierge hospitality, and wine country experiences rooted in Roseburg and the Umpqua Valley.",

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
  ],

  authors: [{ name: "Plate The Umpqua" }],
  creator: "Plate The Umpqua",
  publisher: "Plate The Umpqua",

  verification: {
    google: "PAvYzjqSDb7uh9SushEgxm9FgFwhwq2r",
  },

  openGraph: {
    title: "Plate The Umpqua | Private Hospitality in Roseburg, Oregon",
    description:
      "Private hospitality, chef-led dinners, estate gatherings, and concierge table experiences across Roseburg, the Umpqua Valley, and Southern Oregon.",
    url: "https://platetheumpqua.com",
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
    title: "Plate The Umpqua | Private Hospitality in Roseburg, Oregon",
    description:
      "Chef-led private dining, estate dinners, and elevated hospitality experiences rooted in Roseburg and the Umpqua Valley.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://platetheumpqua.com",
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