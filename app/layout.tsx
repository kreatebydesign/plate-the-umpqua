"use client";

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./globals.css";

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

const navItems = [
  { label: "Experiences", href: "/experiences" },
  { label: "Packages", href: "/packages" },
  { label: "Concierge", href: "/concierge" },
  { label: "The Valley", href: "/the-valley" },
  { label: "Inquiry", href: "/inquiry" },
];

function SiteShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#efe6d4]/10 bg-[#14120e]/58 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-6">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.28em] text-[#efe6d4] md:text-sm"
          >
            Plate The Umpqua
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] uppercase tracking-[0.22em] transition ${
                    active
                      ? "text-[#c4a465]"
                      : "text-[#efe6d4]/68 hover:text-[#c4a465]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/inquiry"
              className="hidden border border-[#c4a465]/45 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#efe6d4]/85 transition hover:bg-[#c4a465] hover:text-[#14120e] lg:inline-block"
            >
              Book
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
              aria-label="Open Menu"
            >
              <span className="h-[1px] w-5 bg-[#efe6d4]" />
              <span className="h-[1px] w-5 bg-[#efe6d4]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#0c0a08]/96 backdrop-blur-2xl md:hidden"
          >
            <div className="flex h-full flex-col justify-between px-6 pb-10 pt-28">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]">
                    Navigation
                  </p>

                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-xs uppercase tracking-[0.24em] text-[#efe6d4]/72"
                  >
                    Close
                  </button>
                </div>

                <nav className="mt-14 flex flex-col gap-7">
                  {navItems.map((item, index) => {
                    const active = pathname === item.href;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.08 + index * 0.05,
                          duration: 0.45,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`block text-[clamp(2.2rem,9vw,4rem)] leading-[0.95] tracking-[-0.04em] transition ${
                            active
                              ? "text-[#c4a465]"
                              : "text-[#efe6d4]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-[#c4a465]/12 pt-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#efe6d4]/40">
                  Roseburg • Umpqua Valley • Southern Oregon
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}

      <footer className="border-t border-[#c4a465]/14 bg-[#0f0d0a] px-5 py-14 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#efe6d4]">
              Plate The Umpqua
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#e9decb]/70">
              Private dining, estate dinners, realtor concierge hospitality,
              and wine country experiences rooted in Roseburg and the Umpqua
              Valley.
            </p>
          </div>

          <div className="grid gap-7 text-sm text-[#e9decb]/70 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4a465]">
                Explore
              </p>

              <div className="mt-4 grid gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition hover:text-[#c4a465]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4a465]">
                Location
              </p>

              <p className="mt-4 leading-7">
                Roseburg, Oregon
                <br />
                Umpqua Valley
                <br />
                Southern Oregon
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-[#c4a465]/12 pt-6 text-[11px] uppercase tracking-[0.18em] text-[#e9decb]/45 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Plate The Umpqua</p>
          <p>Built by Kreate By Design</p>
        </div>
      </footer>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#14120e] text-[#efe6d4] antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}