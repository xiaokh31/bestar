import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Package, Zap, BarChart3, CheckCircle, Clock, Shield, Globe } from "lucide-react";
import { CTASection } from "@/components/marketing";

export const metadata: Metadata = {
  title: "一件代发服务",
  description: "高效的一件代发仓储物流服务，支持多平台对接，订单自动同步，快速出库",
};

const features = [
  {
    icon: Package,
    title: "智能仓储",
    description: "现代化仓储设施，智能库存管理",
    details: ["WMS系统管理", "库存实时监控", "智能货位分配", "库存预警提醒"],
  },
  {
    icon: Zap,
    title: "快速处理",
    description: "订单自动同步，当日出库",
    details: ["API自动对接", "订单实时同步", "当日处理出库", "批量处理能力"],
  },
  {
    icon: Truck,
    title: "灵活配送",
    description: "多渠道配送，次日达服务",
    details: ["FedEx/UPS/Canada Post", "次日达服务", "运费自动比价", "运单实时追踪"],
  },
  {
    icon: BarChart3,
    title: "数据报表",
    description: "完善的数据分析报表",
    details: ["库存报表", "出货统计", "成本分析", "运营洞察"],
  },
];

const platforms = ["Amazon", "Shopify", "eBay", "Walmart", "Etsy", "TikTok Shop"];

export default function DropshippingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                核心服务
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                一件代发服务
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                高效的一件代发仓储物流服务，支持多平台API对接，订单自动同步，快速出库。
                让您专注于销售，我们负责仓储物流。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    获取报价
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">
                    查看其他服务
                  </Link>
                </Button>
              </div>
            </div>
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Truck className="h-32 w-32 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务特点</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              全流程自动化，高效省心
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-8 bg-muted/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="grid grid-cols-2 gap-2">
                        {feature.details.map((detail) => (
                          <li key={detail} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">支持平台</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              对接主流电商平台，订单无缝同步
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((platform) => (
              <div key={platform} className="px-8 py-4 bg-background rounded-xl font-medium">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
