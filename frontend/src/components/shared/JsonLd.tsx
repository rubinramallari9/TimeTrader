export function MarketplaceJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TimeTrader",
    url: base,
    description: "Tregu kryesor i orëve luksoze në Shqipëri dhe Ballkan.",
    inLanguage: ["sq", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/listings?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    areaServed: [
      { "@type": "Country", name: "Albania" },
      { "@type": "Country", name: "Kosovo" },
      { "@type": "Country", name: "North Macedonia" },
      { "@type": "Country", name: "Serbia" },
      { "@type": "Country", name: "Croatia" },
      { "@type": "Country", name: "Bosnia and Herzegovina" },
      { "@type": "Country", name: "Montenegro" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://timetrader.al";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TimeTrader",
    url: base,
    logo: `${base}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Albanian", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
