"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Package, Truck, RefreshCw, CheckCircle } from "lucide-react";
import { CTASection } from "@/components/marketing";
import { useLocale } from "@/i18n/locale-context";

const iconMap: Record<string, React.ElementType> = {
  Package: Package,
  Truck: Truck,
  RefreshCw: RefreshCw,
};

const serviceKeys = ["fba", "dropshipping", "returns"] as const;

export default function ServicesPage() {
  const { t } = useLocale();

  // 从翻译文件动态获取服务数据
  const services = serviceKeys.map((key) => {
    const serviceData = t.services[key] as { title: string; description: string; features?: string[] };
    return {
      id: key,
      title: serviceData?.title || key,
      description: serviceData?.description || "",
      features: serviceData?.features || [],
      icon: key === "fba" ? "Package" : key === "dropshipping" ? "Truck" : "RefreshCw",
      href: `/services/${key}`,
    };
  });

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t.services.pageTitle || t.services.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t.services.pageSubtitle || t.services.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Package;
              const isReversed = index % 2 === 1;
              
              return (
                <div
                  key={service.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={isReversed ? "lg:order-2" : ""}>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild>
                      <Link href="/contact">
                        {t.common.contactNow}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className={`aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${isReversed ? "lg:order-1" : ""}`}>
                    <Icon className="h-24 w-24 text-primary/30" />
                  </div>
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
