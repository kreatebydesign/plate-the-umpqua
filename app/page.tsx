"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";

const work = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const featuredEvenings = [
  {
    label: "Wine Country",
    title: "A private table after the tasting.",
    image: "/images/martin/tasting-event.jpg",
  },
  {
    label: "Estate Dinner",
    title: "The room, the food, the people, fully considered.",
    image: "/images/martin/private-event-table.jpg",
  },
  {
    label: "Closing Gift",
    title: "The first dinner home, handled properly.",
    image: "/images/martin/chef-pour-service.jpg",
  },
  {
    label: "Firelight Gathering",
    title: "An evening that feels like the valley itself.",
    image: "/images/martin/firelight-dining.jpg",
  },
];

const pathways = [
  {
    number: "01",
    title: "Private Table",
    label: "Homes / Couples / Small Gatherings",
    copy: "A chef-led dinner shaped around the home, the season, and the people at the table.",
  },
  {
    number: "02",
    title: "Valley House",
    label: "Wineries / Estates / Retreats",
    copy: "Private hospitality for vineyards, lodges, cabins, estates, and intimate Southern Oregon gatherings.",
  },
  {
    number: "03",
    title: "Concierge Table",
    label: "Realtors / Executives / Luxury Stays",
    copy: "A personal way to welcome clients, host guests, and turn a new space into a first memory.",
  },
];

const access = [
  {
    title: "Single Private Table",
    detail: "Starting at $425",
    copy: "For private dinners, intimate gatherings, and one-off hosting moments.",
  },
  {
    title: "Realtor Concierge",
    detail: "5 Tables / $2,000",
    copy: "A closing gift clients actually remember. A first dinner home, shaped with care.",
  },
  {
    title: "Preferred Partner",
    detail: "10 Tables / $3,750",
    copy: "Priority hospitality access for repeat partners, luxury stays, and client gifting.",
  },
];

const builtFor = [
  "Luxury Realtors",
  "Estate Hosts",
  "Doctors",
  "Wineries",
  "Retreat Properties",
  "Executive Hosting",
  "Private Gatherings",
  "Client Arrival Experiences",
];

const regions = [
  "Roseburg",
  "Umpqua Valley",
  "Southern Oregon",
  "Private Homes",
  "Wineries",
  "Estates",
  "Retreats",
  "Luxury Stays",
];

export default function Home() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen bg-[#14120e] font-[var(--font-work)] text-[#efe6d4]`}
    >
      <header className="fixed left-0 top-0 z-50 w-full px-3 py-3 md:px-5 md:py-5">
        <div className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto] items-center border border-[#d9ccb5]/10 bg-[rgba(10,10,10,0.78)] px-4 py-4 text-[#ebe2d1] shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl md:grid-cols-[1fr_auto_1fr] md:px-7">
          <Link href="/" aria-label="Plate The Umpqua" className="block">
            <div
              className="text-[1.45rem] leading-none tracking-[-0.04em] text-[#f3eadb] md:text-[2.05rem]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Plate The Umpqua
            </div>

            <div className="mt-[7px] text-[8px] font-semibold uppercase tracking-[0.28em] text-[#b9955b] md:text-[10px] md:tracking-[0.43em]">
              Private Hospitality
            </div>
          </Link>

          <nav className="hidden gap-12 text-[10px] font-semibold uppercase tracking-[0.38em] text-[#b9955b] md:flex">
            <Link href="/experiences" className="transition hover:text-white">
              Experiences
            </Link>
            <Link href="/packages" className="transition hover:text-white">
              Packages
            </Link>
            <Link href="/concierge" className="transition hover:text-white">
              Concierge
            </Link>
            <Link href="/the-valley" className="transition hover:text-white">
              The Valley
            </Link>
            <Link href="/inquiry" className="transition hover:text-white">
              Inquiry
            </Link>
          </nav>

          <Link
            href="/inquiry"
            className="justify-self-end border border-[#b9955b]/26 bg-transparent px-4 py-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#f3eadb] transition duration-300 hover:border-[#c4a465] hover:bg-[#c4a465] hover:text-black md:px-6 md:text-[10px] md:tracking-[0.34em]"
          >
            Request
          </Link>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden bg-[#13110d] text-[#efe6d4]">
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center opacity-[0.36]"
          style={{ backgroundImage: "url('/images/martin/chef-action-shot.jpg')" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,17,13,.2)_0%,rgba(19,17,13,.6)_44%,rgba(19,17,13,.98)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(188,139,66,.2),transparent_34%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col justify-between px-5 pb-9 pt-32 md:px-8 md:pt-40 lg:pb-14">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <p className="mb-7 max-w-md text-[9px] font-bold uppercase tracking-[0.34em] text-[#c4a465] md:mb-10 md:text-[10px] md:tracking-[0.5em]">
                Roseburg, Oregon / Umpqua Valley
              </p>

              <h1
                className="max-w-4xl text-[clamp(3.35rem,11vw,9.8rem)] font-medium leading-[0.94] tracking-[-0.062em] text-[#f4ead8]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Private hospitality
                <br />
                for the valley.
              </h1>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
              className="flex items-end lg:justify-end"
            >
              <div className="max-w-xl border-l border-[#c4a465]/30 pl-5 md:pl-7">
                <p className="text-[1.08rem] leading-8 text-[#e9decb] md:text-[1.55rem] md:leading-10">
                  Chef-led dinners, wine country gatherings, and private tables
                  designed for homes, estates, retreats, and evenings that
                  deserve more than a reservation.
                </p>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row md:mt-10">
                  <Link
                    href="/inquiry"
                    className="border border-[#efe6d4]/24 bg-transparent px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#efe6d4] transition hover:border-[#c4a465] hover:text-[#c4a465] md:tracking-[0.32em]"
                  >
                    Start The Inquiry
                  </Link>

                  <Link
                    href="/packages"
                    className="border border-[#efe6d4]/16 bg-transparent px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#efe6d4] transition hover:border-[#c4a465] hover:text-[#c4a465] md:tracking-[0.32em]"
                  >
                    View Packages
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 1, delay: 0.45, ease: "easeOut" }}
            className="mt-16 grid gap-6 border-t border-[#efe6d4]/12 pt-7 sm:grid-cols-2 md:mt-24 md:grid-cols-4 md:pt-8"
          >
            {[
              "Private Chef Dinners",
              "Estate Gatherings",
              "Winery Evenings",
              "Concierge Hospitality",
            ].map((item) => (
              <p
                key={item}
                className="text-[9px] font-bold uppercase leading-5 tracking-[0.27em] text-[#c4a465] md:text-[10px] md:tracking-[0.34em]"
              >
                {item}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#ebe2d1] px-5 py-24 text-[#14120e] md:px-8 md:py-36 lg:py-44">
        <div className="mx-auto max-w-[1760px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="grid gap-10 border-b border-[#14120e]/12 pb-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:pb-20"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#806b3f] md:text-[11px]">
              Featured Evenings
            </p>

            <h2
              className="max-w-5xl text-[clamp(2.85rem,10vw,7.6rem)] font-medium leading-[0.96] tracking-[-0.06em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Four ways the valley becomes the room.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 xl:grid-cols-4">
            {featuredEvenings.map((evening, index) => (
              <motion.article
                key={evening.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={fadeUp}
                transition={{ duration: 0.8, delay: index * 0.07, ease: "easeOut" }}
                className="group relative min-h-[540px] overflow-hidden border border-[#14120e]/10 bg-[#14120e]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                  style={{ backgroundImage: `url('${evening.image}')` }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,14,.12)_0%,rgba(20,18,14,.72)_62%,rgba(20,18,14,.96)_100%)]" />

                <div className="relative flex min-h-[540px] flex-col justify-end p-7 md:p-8">
                  <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.34em] text-[#c4a465]">
                    {evening.label}
                  </p>

                  <h3
                    className="text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#f4ead8]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {evening.title}
                  </h3>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/experiences"
              className="border border-[#14120e]/20 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#806b3f] hover:text-[#806b3f]"
            >
              Explore Experiences
            </Link>

            <Link
              href="/inquiry"
              className="border border-[#14120e]/12 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#806b3f] hover:text-[#806b3f]"
            >
              Start The Inquiry
            </Link>
          </div>
        </div>
      </section>

      <section className="grid min-h-screen bg-[#14120e] text-[#ebe2d1] lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex items-center px-5 py-24 md:px-14 md:py-32 lg:py-40"
        >
          <div>
            <p className="mb-9 text-[10px] font-bold uppercase tracking-[0.38em] text-[#c4a465] md:mb-12 md:text-[11px] md:tracking-[0.44em]">
              Chef Martin
            </p>

            <h2
              className="max-w-4xl text-[clamp(2.85rem,9vw,7.5rem)] font-medium leading-[1] tracking-[-0.055em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              The food matters. The room matters more.
            </h2>

            <p className="mt-9 max-w-2xl text-[1.12rem] leading-8 text-[#eadfcc] md:mt-12 md:text-2xl md:leading-10">
              This is private dining with a host’s eye. The menu, timing, table,
              and atmosphere are shaped together, so the evening feels
              considered from the first pour to the last plate.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0.9, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="min-h-[64vh] bg-cover bg-center lg:min-h-[78vh]"
          style={{ backgroundImage: "url('/images/martin/modern-plating-dark.jpg')" }}
        />
      </section>

      <section
        id="table"
        className="bg-[#14120e] px-5 py-24 text-[#ebe2d1] md:px-8 md:py-36 lg:py-48"
      >
        <div className="mx-auto max-w-[1760px]">
          <div className="grid gap-12 lg:grid-cols-[0.34fr_1.66fr] lg:gap-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#c4a465] md:text-[11px] md:tracking-[0.44em]">
              Ways To Enter
            </p>

            <div className="divide-y divide-[#ebe2d1]/14 border-y border-[#ebe2d1]/14">
              {pathways.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  transition={{
                    duration: 0.75,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="grid gap-7 py-12 lg:grid-cols-[0.14fr_0.68fr_1fr] lg:items-center lg:gap-10 lg:py-16"
                >
                  <p
                    className="text-5xl italic leading-none text-[#c4a465]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {item.number}
                  </p>

                  <div>
                    <p className="mb-5 text-[9px] font-bold uppercase leading-5 tracking-[0.3em] text-[#c4a465] md:mb-6 md:text-[10px] md:tracking-[0.34em]">
                      {item.label}
                    </p>

                    <h3
                      className="text-[clamp(2.75rem,9vw,6rem)] font-medium leading-[1] tracking-[-0.055em]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <p className="max-w-2xl text-[1.1rem] leading-8 text-[#eadfcc] md:text-xl md:leading-9">
                    {item.copy}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row lg:ml-[34%]">
            <Link
              href="/experiences"
              className="border border-[#efe6d4]/24 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#c4a465] hover:text-[#c4a465]"
            >
              View All Experiences
            </Link>

            <Link
              href="/packages"
              className="border border-[#efe6d4]/16 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#c4a465] hover:text-[#c4a465]"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>

      <section className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0.9, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="min-h-[64vh] bg-cover bg-center lg:min-h-[78vh]"
          style={{ backgroundImage: "url('/images/martin/chef-pour-service.jpg')" }}
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex items-center bg-[#d9cbb1] px-5 py-24 text-[#14120e] md:px-14 md:py-32 lg:py-40"
        >
          <div>
            <p className="mb-9 text-[10px] font-bold uppercase tracking-[0.38em] text-[#806b3f] md:mb-12 md:text-[11px] md:tracking-[0.44em]">
              Concierge Hospitality
            </p>

            <h2
              className="text-[clamp(2.85rem,9vw,7.4rem)] font-medium leading-[1] tracking-[-0.055em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              The first dinner home.
            </h2>

            <p className="mt-9 max-w-2xl text-[1.12rem] leading-8 text-[#40392f] md:mt-12 md:text-2xl md:leading-10">
              For realtors, executives, luxury stays, and hosts who want the
              moment to feel considered. A private dinner becomes the gift, the
              welcome, and the story.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row md:mt-12">
              <Link
                href="/concierge"
                className="border border-[#14120e]/28 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#806b3f] hover:text-[#806b3f]"
              >
                Explore Concierge
              </Link>

              <Link
                href="/packages"
                className="border border-[#14120e]/18 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#806b3f] hover:text-[#806b3f]"
              >
                View Packages
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-[#14120e] px-5 py-24 text-[#efe6d4] md:px-8 md:py-32 lg:py-44">
        <div className="mx-auto max-w-[1760px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="grid gap-12 border-b border-white/12 pb-16 md:pb-20 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#c4a465]">
              Built For
            </p>

            <h2
              className="max-w-5xl text-[clamp(2.8rem,9vw,7.4rem)] font-medium leading-[1] tracking-[-0.055em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              The people responsible for unforgettable hosting.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-0 border-b border-white/12 sm:grid-cols-2 lg:grid-cols-4">
            {builtFor.map((item) => (
              <div
                key={item}
                className="border-t border-white/12 px-5 py-9 text-[10px] font-bold uppercase leading-6 tracking-[0.28em] text-[#c4a465] md:border-r md:border-white/12 md:px-6 md:py-10 md:text-[11px] md:tracking-[0.32em]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="region"
        className="relative overflow-hidden bg-[#14120e] px-5 py-24 text-[#ebe2d1] md:px-8 md:py-36 lg:py-48"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
          style={{ backgroundImage: "url('/images/martin/tasting-event.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#14120e]/78" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto grid max-w-[1760px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16"
        >
          <h2
            className="text-[clamp(2.85rem,9vw,7.7rem)] font-medium leading-[1] tracking-[-0.055em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Roseburg is the center. The valley is the room.
          </h2>

          <div>
            <p className="max-w-2xl text-[1.12rem] leading-8 text-[#eadfcc] md:text-2xl md:leading-10">
              Serving homes, wineries, estates, retreats, luxury stays,
              executive gatherings, and private events across Southern Oregon.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-8 border-y border-[#ebe2d1]/14 py-5 md:mt-12 md:grid-cols-4 md:py-6">
              {regions.map((region) => (
                <p
                  key={region}
                  className="border-b border-[#ebe2d1]/10 py-4 text-[9px] font-bold uppercase leading-5 tracking-[0.26em] text-[#c4a465] md:border-b-0 md:text-[10px] md:tracking-[0.3em]"
                >
                  {region}
                </p>
              ))}
            </div>

            <Link
              href="/the-valley"
              className="mt-10 inline-flex border border-[#ebe2d1]/18 px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] transition hover:border-[#c4a465] hover:text-[#c4a465]"
            >
              Explore The Valley
            </Link>
          </div>
        </motion.div>
      </section>

      <section
        id="inquire"
        className="bg-[#ebe2d1] px-5 py-24 text-[#14120e] md:px-8 md:py-36 lg:py-48"
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mx-auto grid max-w-[1760px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20"
        >
          <div>
            <p className="mb-9 text-[10px] font-bold uppercase tracking-[0.38em] text-[#806b3f]">
              Private Inquiries
            </p>

            <h2
              className="text-[clamp(2.85rem,9vw,8rem)] font-medium leading-[1] tracking-[-0.055em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Tell us what the evening should feel like.
            </h2>
          </div>

          <div>
            <p className="mb-9 text-[1.12rem] leading-8 text-[#40392f] md:mb-10 md:text-2xl md:leading-10">
              Occasion, guest count, location, and mood. Plate The Umpqua shapes
              the menu, pacing, and private table around the moment.
            </p>

            <Link
              href="/inquiry"
              className="inline-flex border border-[#14120e]/28 bg-transparent px-8 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#14120e] transition hover:border-[#806b3f] hover:text-[#806b3f]"
            >
              Start The Inquiry
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}