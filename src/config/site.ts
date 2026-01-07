import { SiteConfig, Service, Stat } from "@/types";

export const siteConfig: SiteConfig = {

  name: "Bestar Service CCA",
  description: "专业的跨境物流解决方案提供商 - FBA头程、一件代发、退货换标服务",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://bestarca.com",
  ogImage: "/og-image.jpg",
  links: {
    email: "manage.bestar@gmail.com",
    phone: "+1(587)437 2088",
    address: "7405 108 Ave SE Unit150, Calgary, AB T2C 4N7",
  },
  mainNav: [
    {
      title: "首页",
      href: "/",
    },
    {
      title: "服务",
      href: "/services",
      children: [
        {
          title: "FBA头程",
          href: "/services/fba",
        },
        {
          title: "一件代发",
          href: "/services/dropshipping",
        },
        {
          title: "退货换标",
          href: "/services/returns",
        },
      ],
    },
    {
      title: "关于我们",
      href: "/about",
    },
    {
      title: "新闻动态",
      href: "/news",
    },
    {
      title: "联系我们",
      href: "/contact",
    },
  ],
  footerNav: [
    {
      title: "服务",
      href: "/services",
    },
    {
      title: "关于我们",
      href: "/about",
    },
    {
      title: "隐私政策",
      href: "/privacy",
    },
    {
      title: "服务条款",
      href: "/terms",
    },
  ],
};

// 核心服务
export const services: Service[] = [
  {
    id: "fba",
    title: "FBA头程",
    description: "专业的亚马逊FBA头程物流服务，提供海运、空运、快递多种渠道，时效稳定，价格优惠。",
    icon: "Package",
    href: "/services/fba",
    features: [
      "海运整柜/拼柜服务",
      "空运快速通道",
      "清关一条龙服务",
      "仓储分拣服务",
      "实时货物追踪",
      "专业报关团队",
    ],
  },
  {
    id: "dropshipping",
    title: "一件代发",
    description: "高效的一件代发仓储物流服务，支持多平台对接，订单自动同步，快速出库。",
    icon: "Truck",
    href: "/services/dropshipping",
    features: [
      "多平台API对接",
      "自动订单同步",
      "智能库存管理",
      "次日达配送",
      "退换货处理",
      "包装定制服务",
    ],
  },
  {
    id: "returns",
    title: "退货换标",
    description: "专业的退货处理和换标服务，帮助您降低退货成本，提高商品周转率。",
    icon: "RefreshCw",
    href: "/services/returns",
    features: [
      "退货接收处理",
      "商品质检分类",
      "重新包装换标",
      "二次销售处理",
      "报废销毁服务",
      "数据报告分析",
    ],
  },
];

// 统计数据
export const stats: Stat[] = [
  {
    label: "服务客户",
    value: "2000",
    suffix: "+",
    description: "跨境电商卖家",
  },
  {
    label: "日处理订单",
    value: "50000",
    suffix: "+",
    description: "高效处理能力",
  },
  {
    label: "仓储面积",
    value: "100000",
    suffix: "㎡",
    description: "现代化仓储设施",
  },
  {
    label: "服务年限",
    value: "10",
    suffix: "+",
    description: "行业经验积累",
  },
];

// 合作伙伴
export const partners = [
  { name: "Amazon", logo: "/partners/amazon.svg" },
  { name: "FedEx", logo: "/partners/fedex.svg" },
  { name: "UPS", logo: "/partners/ups.svg" },
  { name: "Canada Post", logo: "/partners/canada-post.svg" },
  { name: "DHL", logo: "/partners/dhl.svg" },
];
