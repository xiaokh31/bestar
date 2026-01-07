"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Package, Truck, RefreshCw, CheckCircle } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { getServicesConfig } from "@/config/site-config";

const iconMap: Record<string, React.ElementType> = {
  Package: Package,
  Truck: Truck,
  RefreshCw: RefreshCw,
};

export function ServicesSection() {
  const { t } = useLocale();
  const services = getServicesConfig(t);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.services.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Package;
            return (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 4).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    <Link href={service.href}>
                      {t.common.learnMore}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/services">
              {t.services.viewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
