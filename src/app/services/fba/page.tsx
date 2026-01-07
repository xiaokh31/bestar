import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Ship, Plane, Truck, CheckCircle, Clock, Shield, Globe } from "lucide-react";
import { CTASection } from "@/components/marketing";

export const metadata: Metadata = {
  title: "FBA头程服务",
  description: "专业的亚马逊FBA头程物流服务，提供海运、空运、快递多种渠道，时效稳定，价格优惠",
};

const channels = [
  {
    icon: Ship,
    title: "海运服务",
    description: "整柜/拼柜服务，经济实惠",
    features: ["整柜直送", "拼柜服务", "经济实惠", "适合大货量"],
  },
  {
    icon: Plane,
    title: "空运服务",
    description: "快速通道，时效稳定",
    features: ["时效快", "安全可靠", "适合紧急货物", "多航线选择"],
  },
  {
    icon: Truck,
    title: "快递服务",
    description: "门到门配送，方便快捷",
    features: ["门到门服务", "全程追踪", "小包专线", "灵活便捷"],
  },
];

const advantages = [
  { icon: Clock, title: "时效保证", description: "多渠道时效选择，准时送达" },
  { icon: Shield, title: "安全可靠", description: "全程保险保障，货物安全无忧" },
  { icon: Globe, title: "全球覆盖", description: "覆盖北美、欧洲主要FBA仓库" },
];

export default function FBAServicePage() {
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
                FBA头程物流服务
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                专业的亚马逊FBA头程物流服务，提供海运、空运、快递多种渠道。
                时效稳定，价格优惠，一站式清关服务，让您的货物安全快速送达FBA仓库。
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
              <Package className="h-32 w-32 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">多种运输渠道</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              根据您的需求选择最合适的运输方式
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.title} className="p-8 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{channel.title}</h3>
                  <p className="text-muted-foreground mb-4">{channel.description}</p>
                  <ul className="space-y-2">
                    {channel.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务优势</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <div key={adv.title} className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{adv.title}</h3>
                  <p className="text-muted-foreground">{adv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
