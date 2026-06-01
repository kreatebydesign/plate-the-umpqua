import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: "https://platetheumpqua.com/sitemap.xml",

    host: "https://platetheumpqua.com",
  };
}