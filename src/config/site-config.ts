import { useLocale } from "@/i18n/locale-context";

// 根据当前语言返回站点配置
export function getSiteConfig(t: any) {
  return {
    name: "Bestar Service CCA",
    description: t.about.description || "专业的跨境物流解决方案提供商 - FBA头程、一件代发、退货换标服务",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://bestarca.com",
    ogImage: "/og-image.jpg",
    links: {
      email: "manage.bestar@gmail.com",
      phone: "+1(587)437 2088",
      address: "7405 108 Ave SE Unit150, Calgary, AB T2C 4N7",
    },
    mainNav: [
      {
        title: t.nav.home,
        href: "/",
      },
      {
        title: t.nav.services,
        href: "/services",
        children: [
          {
            title: t.nav.fba,
            href: "/services/fba",
          },
          {
            title: t.nav.dropshipping,
            href: "/services/dropshipping",
          },
          {
            title: t.nav.returns,
            href: "/services/returns",
          },
        ],
      },
      {
        title: t.nav.about,
        href: "/about",
      },
      {
        title: t.nav.news,
        href: "/news",
      },
      {
        title: t.nav.contact,
        href: "/contact",
      },
    ],
    footerNav: [
      {
        title: t.nav.services,
        href: "/services",
      },
      {
        title: t.nav.about,
        href: "/about",
      },
      {
        title: t.nav.privacy || "隐私政策",
        href: "/privacy",
      },
      {
        title: t.nav.terms || "服务条款",
        href: "/terms",
      },
    ],
  };
}

// 核心服务配置
export function getServicesConfig(t: any) {
  return [
    {
      id: "fba",
      title: t.services.fba.title,
      description: t.services.fba.description,
      icon: "Package",
      href: "/services/fba",
      features: t.services.fba.features,
    },
    {
      id: "dropshipping",
      title: t.services.dropshipping.title,
      description: t.services.dropshipping.description,
      icon: "Truck",
      href: "/services/dropshipping",
      features: t.services.dropshipping.features,
    },
    {
      id: "returns",
      title: t.services.returns.title,
      description: t.services.returns.description,
      icon: "RefreshCw",
      href: "/services/returns",
      features: t.services.returns.features,
    },
  ];
}

// 统计数据配置
export function getStatsConfig(t: any) {
  return [
    {
      label: t.stats.customers,
      value: "2000",
      suffix: "+",
      description: t.hero.customers,
    },
    {
      label: t.stats.orders,
      value: "50000",
      suffix: "+",
      description: t.features.efficient.description,
    },
    {
      label: t.stats.warehouse,
      value: "100000",
      suffix: "㎡",
      description: t.about.advantages?.[1] || t.stats.warehouse,
    },
    {
      label: t.stats.years,
      value: "10",
      suffix: "+",
      description: t.hero.experience,
    },
  ];
}

// 合作伙伴配置
export function getPartnersConfig() {
  return [
    { name: "Amazon", logo: "/partners/amazon.svg" },
    { name: "FedEx", logo: "/partners/fedex.svg" },
    { name: "UPS", logo: "/partners/ups.svg" },
    { name: "Canada Post", logo: "/partners/canada-post.svg" },
    { name: "DHL", logo: "/partners/dhl.svg" },
  ];
}
