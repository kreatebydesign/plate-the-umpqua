const services = [
    {
      kicker: "01 / Signature Care",
      title: "The Weekly Refresh",
      description:
        "A refined recurring clean designed for busy homes that need to feel calm, polished, and beautifully maintained.",
      price: "From $225",
    },
    {
      kicker: "02 / Deep Detail",
      title: "The Full Home Reset",
      description:
        "A top-to-bottom detail service for kitchens, bathrooms, floors, glass, baseboards, surfaces, and final presentation.",
      price: "From $475",
    },
    {
      kicker: "03 / Estate Standard",
      title: "The Private Residence Clean",
      description:
        "A premium service experience for larger homes, estates, real estate prep, hosting days, and high-touch living spaces.",
      price: "From $650",
    },
  ];
  
  const process = [
    {
      number: "01",
      title: "Walkthrough",
      text: "We learn the home, the priorities, the materials, the problem areas, and how the space should feel when complete.",
    },
    {
      number: "02",
      title: "Room-by-Room Detail",
      text: "Every room follows a clean visual system: surfaces, floors, glass, touchpoints, scent, flow, and final styling.",
    },
    {
      number: "03",
      title: "Final Styling Pass",
      text: "The last layer is presentation. Pillows reset, counters cleared, lighting softened, and the home left calm.",
    },
  ];
  
  const reviews = [
    {
      name: "Amanda R.",
      location: "Roseburg, OR",
      text: "The house felt peaceful the second I walked in. It was not just clean, it felt styled, fresh, and completely reset.",
    },
    {
      name: "Lauren M.",
      location: "Umpqua Valley",
      text: "The detail was beautiful. Glass, baseboards, kitchen, bathrooms, everything felt soft, polished, and cared for.",
    },
    {
      name: "Stephanie K.",
      location: "Winchester, OR",
      text: "This feels like the cleaning service you would trust before hosting family, listing a home, or resetting your life.",
    },
  ];
  
  export default function Page() {
    return (
      <main className="min-h-screen bg-[#fbf5f1] text-[#24191a]">
        <section className="relative min-h-screen overflow-hidden bg-[#301e23] text-white">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop"
              alt="Soft luxury home interior"
              className="h-full w-full object-cover opacity-42"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(39,23,28,.98)_0%,rgba(39,23,28,.82)_42%,rgba(39,23,28,.42)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,rgba(255,203,218,.34),transparent_34%)]" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#fbf5f1] to-transparent" />
          </div>
  
          <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-8 md:px-10">
            <div className="font-serif text-sm uppercase tracking-[0.48em] text-[#ffe0e8]">
              Buttcrack Cleaning Company
            </div>
  
            <nav className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.34em] text-white/68 md:flex">
              <a href="#services">Services</a>
              <a href="#trust">Trust</a>
              <a href="#reviews">Reviews</a>
              <a href="#quote">Quote</a>
            </nav>
          </header>
  
          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-16 px-6 pb-28 pt-10 md:grid-cols-[1.05fr_.95fr] md:px-10">
            <div>
              <p className="mb-7 text-xs uppercase tracking-[0.55em] text-[#ffc5d6]">
                Luxury Residential Cleaning
              </p>
  
              <h1 className="max-w-5xl font-serif text-[4.3rem] font-light leading-[0.88] tracking-[-0.07em] md:text-[8rem]">
                Soft.
                <span className="block italic text-[#ffe0e8]">Fresh.</span>
                Flawless.
              </h1>
  
              <p className="mt-9 max-w-xl text-lg leading-8 text-white/76">
                A beautifully polished cleaning experience for homes that deserve
                warmth, calm, detail, and that fresh Pottery Barn feeling the
                second you walk through the door.
              </p>
  
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#quote"
                  className="border border-[#ffc5d6] bg-[#ffc5d6] px-8 py-4 text-center text-xs font-semibold uppercase tracking-[0.32em] text-[#301e23]"
                >
                  Request Quote
                </a>
  
                <a
                  href="#reviews"
                  className="border border-white/24 bg-white/[0.05] px-8 py-4 text-center text-xs uppercase tracking-[0.32em] text-white backdrop-blur"
                >
                  See Reviews
                </a>
              </div>
            </div>
  
            <div className="relative">
              <div className="absolute -left-8 -top-8 h-40 w-40 border-l border-t border-[#ffc5d6]/55" />
              <div className="absolute -bottom-8 -right-8 h-40 w-40 border-b border-r border-[#ffc5d6]/55" />
  
              <div className="border border-white/16 bg-[#3b252b]/82 p-5 shadow-[0_60px_160px_rgba(0,0,0,.42)] backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1800&auto=format&fit=crop"
                  alt="Clean luxury living room"
                  className="h-[560px] w-full object-cover"
                />
  
                <div className="grid grid-cols-2 border-t border-white/12">
                  <div className="border-r border-white/12 p-6">
                    <p className="font-serif text-4xl font-light text-[#ffc5d6]">
                      4.9
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Sample rating standard
                    </p>
                  </div>
  
                  <div className="p-6">
                    <p className="font-serif text-4xl font-light text-[#ffc5d6]">
                      1K+
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Concept review count
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* TRUST BAR */}
        <section id="trust" className="relative z-20 -mt-20 px-6 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-px border border-[#efd2d9] bg-[#efd2d9] shadow-[0_30px_100px_rgba(87,45,58,.12)] md:grid-cols-4">
            {[
              "Licensed & insured",
              "Background-checked team",
              "Pet-safe options",
              "Satisfaction follow-up",
            ].map((item) => (
              <div key={item} className="bg-[#fffaf7] p-7 text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-[#a65d73]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
  
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-[.9fr_1.1fr] md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[#b86782]">
              The Feeling
            </p>
  
            <h2 className="mt-6 font-serif text-5xl font-light leading-[1] tracking-[-0.05em] md:text-7xl">
              Feminine, calm, polished, and trusted.
            </h2>
          </div>
  
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1600&auto=format&fit=crop"
              alt="Soft bedroom styling"
              className="h-[540px] w-full object-cover"
            />
  
            <div className="flex flex-col justify-end bg-[#f3e4df] p-8">
              <p className="font-serif text-3xl font-light leading-10 text-[#2c2020]">
                This is the cleaning brand for women who want the house to feel
                reset, styled, soft, and peaceful.
              </p>
  
              <div className="mt-10 h-px bg-[#d9a7b7]" />
  
              <p className="mt-8 text-sm uppercase tracking-[0.32em] text-[#a65d73]">
                Fresh home. Clear mind. Soft landing.
              </p>
            </div>
          </div>
        </section>
  
        <section id="services" className="bg-[#fffaf7] px-6 py-28 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#b86782]">
                  Services
                </p>
  
                <h2 className="mt-6 font-serif text-5xl font-light tracking-[-0.05em] md:text-7xl">
                  Signature home care.
                </h2>
              </div>
  
              <p className="max-w-md text-lg leading-8 text-[#6d5a5e]">
                Built for busy families, beautiful homes, hosting days,
                move-outs, real estate prep, and women who want their space back.
              </p>
            </div>
  
            <div className="grid gap-px overflow-hidden border border-[#efd2d9] bg-[#efd2d9] md:grid-cols-3">
              {services.map((service) => (
                <article key={service.title} className="bg-[#fffaf7] p-8">
                  <p className="text-xs uppercase tracking-[0.38em] text-[#b86782]">
                    {service.kicker}
                  </p>
  
                  <h3 className="mt-10 font-serif text-4xl font-light tracking-[-0.04em]">
                    {service.title}
                  </h3>
  
                  <p className="mt-6 min-h-32 leading-8 text-[#6d5a5e]">
                    {service.description}
                  </p>
  
                  <div className="mt-10 border-t border-[#efd2d9] pt-6">
                    <p className="font-serif text-2xl font-light">
                      {service.price}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
  
        <section className="grid bg-[#301e23] text-white md:grid-cols-2">
          <div className="min-h-[720px]">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1800&auto=format&fit=crop"
              alt="Bright clean kitchen"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
  
          <div className="flex items-center px-6 py-24 md:px-16">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#ffc5d6]">
                Before / After Energy
              </p>
  
              <h2 className="mt-6 font-serif text-5xl font-light leading-[1] tracking-[-0.05em] md:text-7xl">
                The home should feel lighter when we leave.
              </h2>
  
              <p className="mt-8 max-w-xl text-lg leading-9 text-white/72">
                Every room is treated like a styled scene. Surfaces, glass,
                floors, scent, softness, alignment, and final presentation all
                matter.
              </p>
  
              <div className="mt-12 grid grid-cols-2 border border-white/14">
                <div className="border-r border-white/14 p-6">
                  <p className="font-serif text-4xl font-light text-[#ffc5d6]">
                    5★
                  </p>
                  <p className="mt-2 text-sm text-white/54">Service standard</p>
                </div>
  
                <div className="p-6">
                  <p className="font-serif text-4xl font-light text-[#ffc5d6]">
                    100%
                  </p>
                  <p className="mt-2 text-sm text-white/54">
                    Detail-focused care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <section id="method" className="mx-auto max-w-7xl px-6 py-28 md:px-10">
          <div className="grid gap-14 md:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#b86782]">
                Method
              </p>
  
              <h2 className="mt-6 font-serif text-5xl font-light leading-[1] tracking-[-0.05em] md:text-7xl">
                Gentle service. Serious detail.
              </h2>
            </div>
  
            <div className="border-t border-[#efd2d9]">
              {process.map((item) => (
                <div
                  key={item.number}
                  className="grid gap-6 border-b border-[#efd2d9] py-9 md:grid-cols-[120px_1fr]"
                >
                  <p className="text-xs uppercase tracking-[0.42em] text-[#b86782]">
                    {item.number}
                  </p>
  
                  <div>
                    <h3 className="font-serif text-3xl font-light tracking-[-0.04em]">
                      {item.title}
                    </h3>
  
                    <p className="mt-3 max-w-2xl leading-8 text-[#6d5a5e]">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section id="reviews" className="bg-[#fffaf7] px-6 py-28 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 grid gap-10 md:grid-cols-[.85fr_1.15fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#b86782]">
                  Reviews
                </p>
  
                <h2 className="mt-6 font-serif text-5xl font-light leading-[1] tracking-[-0.05em] md:text-7xl">
                  Trust built before the first visit.
                </h2>
              </div>
  
              <div className="grid gap-px border border-[#efd2d9] bg-[#efd2d9] md:grid-cols-3">
                <div className="bg-[#fffaf7] p-7">
                  <p className="font-serif text-5xl font-light text-[#b86782]">
                    1,000+
                  </p>
                  <p className="mt-3 text-sm text-[#6d5a5e]">
                    Concept review count
                  </p>
                </div>
  
                <div className="bg-[#fffaf7] p-7">
                  <p className="font-serif text-5xl font-light text-[#b86782]">
                    4.9
                  </p>
                  <p className="mt-3 text-sm text-[#6d5a5e]">
                    Sample rating standard
                  </p>
                </div>
  
                <div className="bg-[#fffaf7] p-7">
                  <p className="font-serif text-5xl font-light text-[#b86782]">
                    24h
                  </p>
                  <p className="mt-3 text-sm text-[#6d5a5e]">
                    Priority response
                  </p>
                </div>
              </div>
            </div>
  
            <div className="grid gap-px border border-[#efd2d9] bg-[#efd2d9] md:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.name} className="bg-[#fffaf7] p-8">
                  <p className="text-[#b86782]">★★★★★</p>
  
                  <p className="mt-8 min-h-36 font-serif text-2xl font-light leading-9 text-[#2c2020]">
                    “{review.text}”
                  </p>
  
                  <div className="mt-10 border-t border-[#efd2d9] pt-6">
                    <p className="text-sm uppercase tracking-[0.28em] text-[#2c2020]">
                      {review.name}
                    </p>
                    <p className="mt-2 text-sm text-[#8a7478]">
                      {review.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
  
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#9f8a8f]">
              Demo review content for concept presentation only.
            </p>
          </div>
        </section>
  
        <section id="quote" className="relative overflow-hidden bg-[#301e23] px-6 py-32 text-white md:px-10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2200&auto=format&fit=crop"
              alt="Soft styled luxury room"
              className="h-full w-full object-cover opacity-28"
            />
            <div className="absolute inset-0 bg-[#301e23]/78" />
          </div>
  
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-[#ffc5d6]">
              Buttcrack Cleaning Company
            </p>
  
            <h2 className="mt-8 font-serif text-6xl font-light leading-[0.95] tracking-[-0.06em] md:text-8xl">
              Luxury cleaning that gets every crack.
            </h2>
  
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/74">
              Premium residential cleaning for clients who want the job handled
              beautifully, discreetly, and right the first time.
            </p>
  
            <a
              href="mailto:hello@example.com"
              className="mt-12 inline-block border border-[#ffc5d6] bg-[#ffc5d6] px-9 py-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#301e23]"
            >
              Request Private Quote
            </a>
          </div>
        </section>
  
        <footer className="bg-[#fbf5f1] px-6 py-10 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 border-t border-[#efd2d9] pt-8 md:flex-row">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[#9c5a70]">
                Buttcrack Cleaning Company
              </p>
              <p className="mt-3 text-sm text-[#6d5a5e]">
                Luxury residential cleaning for fresh, elevated homes.
              </p>
            </div>
  
            <p className="text-sm text-[#6d5a5e]">
              Built by KXD. KREATE. ELEVATE. DOMINATE.
            </p>
          </div>
        </footer>
      </main>
    );
  }