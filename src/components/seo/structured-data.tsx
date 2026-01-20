import Script from "next/script";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

// 组织结构化数据
export function OrganizationSchema({
  name = "Bestar Service CCA",
  url = "https://bestarcca.com",
  logo = "https://bestarcca.com/images/logo/logo.png",
  description = "加拿大专业跨境物流服务商，提供FBA、卡派服务、北美跨境物流、Amazon FBA、仓储管理、一件代发、退货换标等全方位物流解决方案。",
  email = "manage.bestar@gmail.com",
  phone = "+1-587-437-2088",
  address = {
    streetAddress: "Calgary",
    addressLocality: "Calgary",
    addressRegion: "AB",
    postalCode: "T2C",
    addressCountry: "CA",
  },
  sameAs = [],
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    email,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    sameAs,
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps extends OrganizationSchemaProps {
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

// 本地商家结构化数据
export function LocalBusinessSchema({
  name = "Bestar Service CCA",
  url = "https://bestarcca.com",
  logo = "https://bestarcca.com/images/logo/logo.png",
  description = "加拿大专业跨境物流服务商",
  email = "manage.bestar@gmail.com",
  phone = "+1-587-437-2088",
  address = {
    streetAddress: "Calgary",
    addressLocality: "Calgary",
    addressRegion: "AB",
    postalCode: "T2C",
    addressCountry: "CA",
  },
  priceRange = "$$",
  openingHours = ["Mo-Fr 08:30-17:00"],
  geo,
}: LocalBusinessSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#localbusiness`,
    name,
    url,
    logo,
    image: logo,
    description,
    email,
    telephone: phone,
    priceRange,
    openingHoursSpecification: openingHours.map((hours) => {
      const [days, time] = hours.split(" ");
      const [opens, closes] = time?.split("-") || ["08:30", "17:00"];
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days?.split("-").map((d) => d.trim()),
        opens,
        closes,
      };
    }),
    address: {
      "@type": "PostalAddress",
      ...address,
    },
  };

  if (geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  serviceType?: string;
  areaServed?: string[];
}

// 服务结构化数据
export function ServiceSchema({
  name,
  description,
  url,
  provider = "Bestar Service CCA",
  serviceType = "Logistics Service",
  areaServed = ["Canada", "United States"],
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    serviceType,
    areaServed: areaServed.map((area) => ({
      "@type": "Country",
      name: area,
    })),
  };

  return (
    <Script
      id={`service-schema-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

// 面包屑导航结构化数据
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
}

// FAQ结构化数据
export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

// 网站结构化数据
export function WebsiteSchema({
  name = "Bestar Service CCA",
  url = "https://bestarcca.com",
  description = "加拿大专业跨境物流服务商",
  potentialAction,
}: WebsiteSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage: ["zh-CN", "en-US", "fr-CA"],
  };

  if (potentialAction) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: potentialAction.target,
      },
      "query-input": potentialAction.queryInput,
    };
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
