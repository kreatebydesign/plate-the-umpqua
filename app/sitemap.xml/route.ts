export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl = "https://platetheumpqua.com";
  const now = new Date().toISOString();

  const urls = [
    { loc: baseUrl, changefreq: "weekly", priority: "1" },
    { loc: `${baseUrl}/experiences`, changefreq: "weekly", priority: "0.95" },
    { loc: `${baseUrl}/packages`, changefreq: "weekly", priority: "0.92" },
    { loc: `${baseUrl}/concierge`, changefreq: "weekly", priority: "0.9" },
    { loc: `${baseUrl}/the-valley`, changefreq: "monthly", priority: "0.85" },
    { loc: `${baseUrl}/inquiry`, changefreq: "monthly", priority: "0.8" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
<loc>${url.loc}</loc>
<lastmod>${now}</lastmod>
<changefreq>${url.changefreq}</changefreq>
<priority>${url.priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}