import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, Package, CheckCircle, Trash2, Tag, BarChart3 } from "lucide-react";
import { CTASection } from "@/components/marketing";

export const metadata: Metadata = {
  title: "退货换标服务",
  description: "专业的退货处理和换标服务，帮助您降低退货成本，提高商品周转率",
};

const services = [
  {
    icon: Package,
    title: "退货接收",
    description: "专业接收处理各类退货",
  },
  {
    icon: CheckCircle,
    title: "质检分类",
    description: "严格质检，精准分类",
  },
  {
    icon: Tag,
    title: "重新换标",
    description: "换标重新包装入库",
  },
  {
    icon: RefreshCw,
    title: "二次销售",
    description: "翻新处理再上架销售",
  },
  {
    icon: Trash2,
    title: "报废处理",
    description: "不可售商品妥善处理",
  },
  {
    icon: BarChart3,
    title: "数据报告",
    description: "完整的退货分析报告",
  },
];

const process = [
  { step: "01", title: "退货接收", description: "接收各渠道退货包裹" },
  { step: "02", title: "拆包检验", description: "开箱检查商品状态" },
  { step: "03", title: "质量评估", description: "评估商品是否可二次销售" },
  { step: "04", title: "分类处理", description: "按照评估结果分类" },
  { step: "05", title: "换标包装", description: "可售商品重新包装换标" },
  { step: "06", title: "入库/销毁", description: "入库上架或报废处理" },
];

export default function ReturnsServicePage() {
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
                退货换标服务
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                专业的退货处理和换标服务，帮助您降低退货成本，提高商品周转率。
                让退货不再是负担，而是新的销售机会。
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
              <RefreshCw className="h-32 w-32 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">服务内容</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              全面的退货处理解决方案
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="p-6 bg-muted/30 rounded-xl text-center hover:bg-muted/50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">处理流程</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              标准化的退货处理流程，确保每一件商品都得到妥善处理
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-primary/20">{item.step}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-full w-8 h-0.5 bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
