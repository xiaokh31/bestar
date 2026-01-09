// ==========================================
// 站点静态配置 (不依赖翻译)
// ==========================================

// 站点联系信息
export const siteLinks = {
  email: "manage.bestar@gmail.com",
  phone: "+1(587)437 2088",
  address: "7405 108 Ave SE Unit150, Calgary, AB T2C 4N7",
};

// 站点基本信息
export const siteInfo = {
  name: "Bestar Service CCA",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://bestarcca.com",
  ogImage: "/og-image.jpg",
};

// ==========================================
// 解决方案配置 (统一配置，避免重复定义)
// ==========================================
export const solutionConfigs = [
  { key: "fbaLastMile", icon: "Package", slug: "fba-last-mile", image: "/images/services/Express Delivery.jpg" },
  { key: "truckFreight", icon: "Truck", slug: "truck-freight", image: "/images/services/Truck Delivery.jpg" },
  { key: "crossBorder", icon: "Globe", slug: "cross-border", image: "/images/services/Cross-border Logistics.jpg" },
  { key: "amazonFba", icon: "ShoppingCart", slug: "amazon-fba", image: "/images/services/Amazon FBA.jpg" },
  { key: "warehouse", icon: "Warehouse", slug: "warehouse", image: "/images/services/Warehouse.jpg" },
  { key: "dropshipping", icon: "Ship", slug: "dropshipping", image: "/images/services/Dropshipping.jpg" },
  { key: "returns", icon: "RefreshCw", slug: "returns", image: "/images/services/Returns.jpg" },
] as const;

export type SolutionKey = typeof solutionConfigs[number]["key"];
export type SolutionSlug = typeof solutionConfigs[number]["slug"];

// ==========================================
// 动态配置函数 (依赖翻译)
// ==========================================

// 根据当前语言返回站点配置
export function getSiteConfig(t: any) {
  return {
    name: siteInfo.name,
    description: t.about?.description || "专业的跨境物流解决方案提供商",
    url: siteInfo.url,
    ogImage: siteInfo.ogImage,
    links: siteLinks,
    mainNav: [
      { title: t.nav?.home || "首页", href: "/" },
      {
        title: t.nav?.solutions || "解决方案",
        href: "/solutions",
        children: solutionConfigs.map(({ key, slug }) => ({
          title: (t.solutions?.[key] as { title: string } | undefined)?.title || key,
          href: `/solutions/${slug}`,
        })),
      },
      { title: t.nav?.about || "关于我们", href: "/about" },
      { title: t.nav?.news || "新闻动态", href: "/news" },
      { title: t.nav?.contact || "联系我们", href: "/contact" },
    ],
    footerNav: [
      { title: t.nav?.solutions || "解决方案", href: "/solutions" },
      { title: t.nav?.about || "关于我们", href: "/about" },
      { title: t.nav?.privacy || "隐私政策", href: "/privacy" },
      { title: t.nav?.terms || "服务条款", href: "/terms" },
    ],
  };
}

// 获取解决方案列表配置（带翻译）
export function getSolutionsConfig(t: any) {
  return solutionConfigs.map(({ key, icon, slug, image }) => {
    const solutionData = t.solutions?.[key] as { title: string; description: string; features?: string[] } | undefined;
    return {
      id: key,
      key,
      title: solutionData?.title || key,
      description: solutionData?.description || "",
      features: solutionData?.features || [],
      icon,
      slug,
      image,
      href: `/solutions/${slug}`,
    };
  });
}

// 根据slug获取单个解决方案配置
export function getSolutionBySlug(slug: string) {
  return solutionConfigs.find(s => s.slug === slug);
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
