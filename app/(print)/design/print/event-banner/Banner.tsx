import Image from "next/image";
import styles from "./banner.module.css";

const CATEGORIES = ["Restaurants", "Wineries", "Breweries", "Events"] as const;

const SPONSORS = [
  {
    key: "allen",
    name: "Allen & Allen Construction",
  },
  {
    key: "opb",
    name: "Oregon Pacific Bank",
    src: "/images/print/logos/oregon-pacific-bank.png",
    width: 960,
    height: 420,
    className: "logoOpb",
  },
  {
    key: "spitz",
    name: "Spitz / Ten Down",
    src: "/images/print/logos/spitz-tendown.png",
    width: 900,
    height: 420,
    className: "logoSpitz",
  },
  {
    key: "kreate",
    name: "Kreate by Design",
    src: "/images/print/logos/kreate-by-design.png",
    width: 900,
    height: 420,
    className: "logoKreate",
  },
] as const;

export default function Banner() {
  return (
    <article className={styles.banner} aria-label="Plate The Umpqua event banner">
      <div className={styles.atmosphere} aria-hidden="true">
        <div className={styles.wash} />
        <div className={styles.vineyard} />
        <div className={styles.mountains} />
        <div className={styles.contourA} />
        <div className={styles.contourB} />
        <div className={styles.goldLight} />
        <div className={styles.grain} />
        <div className={styles.vignette} />
      </div>

      <div className={styles.safe}>
        <header className={styles.zoneTop}>
          <h1 className={styles.brand}>Plate The Umpqua</h1>
        </header>

        <section className={styles.zoneMiddle}>
          <p className={styles.hero}>
            <span className={styles.heroExplore}>Explore</span>
            <span className={styles.heroPlace}>The Umpqua</span>
          </p>
          <p className={styles.categories}>
            {CATEGORIES.map((item, index) => (
              <span key={item} className={styles.categoryItem}>
                {index > 0 ? (
                  <span className={styles.bullet} aria-hidden="true">
                    •
                  </span>
                ) : null}
                {item}
              </span>
            ))}
          </p>
        </section>

        <footer className={styles.zoneBottom}>
          <p className={styles.website}>PlateTheUmpqua.com</p>

          <div className={styles.scan}>
            <div className={styles.qrFrame}>
              <Image
                src="/images/print/qr/platetheumpqua-qr.svg"
                alt="QR code linking to PlateTheUmpqua.com"
                width={220}
                height={220}
                className={styles.qr}
                unoptimized
              />
            </div>
            <p className={styles.scanLabel}>Scan to Explore</p>
          </div>

          <p className={styles.partnersCaption}>Proud Community Partners</p>

          <ul className={styles.partnerRow}>
            {SPONSORS.map((sponsor) => (
              <li key={sponsor.key} className={styles.partnerSlot}>
                {"src" in sponsor && sponsor.src ? (
                  <Image
                    src={sponsor.src}
                    alt={sponsor.name}
                    width={sponsor.width}
                    height={sponsor.height}
                    className={`${styles.sponsorLogo} ${styles[sponsor.className]}`}
                    unoptimized
                  />
                ) : (
                  <div className={styles.allenMark} aria-label={sponsor.name}>
                    <span className={styles.allenName}>Allen &amp; Allen</span>
                    <span className={styles.allenTrade}>Construction</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </article>
  );
}
