"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { label: "Experiences", href: "/experiences" },
  { label: "Packages", href: "/packages" },
  { label: "Partners", href: "/partner-concierge" },
  { label: "Concierge", href: "/concierge" },
  { label: "The Valley", href: "/the-valley" },
  { label: "Inquiry", href: "/inquiry" },
];

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] uppercase tracking-[0.22em] transition ${
                  pathname === item.href
                    ? "text-[#c4a465]"
                    : "text-[#efe6d4]/68 hover:text-[#c4a465]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label="Open Menu"
          >
            <span className="h-[1px] w-5 bg-[#efe6d4]" />
            <span className="h-[1px] w-5 bg-[#efe6d4]" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block text-[clamp(2.2rem,9vw,4rem)] leading-[0.95] tracking-[-0.04em] ${
                        pathname === item.href
                          ? "text-[#c4a465]"
                          : "text-[#efe6d4]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <p className="border-t border-[#c4a465]/12 pt-6 text-[10px] uppercase tracking-[0.28em] text-[#efe6d4]/40">
                Roseburg • Umpqua Valley • Southern Oregon
              </p>
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
              and wine country experiences rooted in Roseburg and the Umpqua Valley.
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
      </footer>
    </>
  );
}
