"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSiteConfig } from "@/config/site-config";
import { useLocale } from "@/i18n/locale-context";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLocale();
  const siteConfig = getSiteConfig(t);

  // 从翻译文件动态获取快速链接
  const quickLinks = [
    { title: t.nav.home, href: "/" },
    { title: t.nav.services, href: "/services" },
    { title: t.nav.about, href: "/about" },
    { title: t.nav.news, href: "/news" },
    { title: t.nav.contact, href: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{siteConfig.name}</h3>
            <p className="text-sm opacity-80">
              {t.about.description || "专业的跨境物流解决方案提供商 - FBA头程、一件代发、退货换标服务"}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.quickLinks}</h4>
            <nav className="flex flex-col space-y-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm opacity-80 hover:opacity-100 hover:underline"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.ourServices}</h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/services/fba"
                className="text-sm opacity-80 hover:opacity-100 hover:underline"
              >
                {t.nav.fba}
              </Link>
              <Link
                href="/services/dropshipping"
                className="text-sm opacity-80 hover:opacity-100 hover:underline"
              >
                {t.nav.dropshipping}
              </Link>
              <Link
                href="/services/returns"
                className="text-sm opacity-80 hover:opacity-100 hover:underline"
              >
                {t.nav.returns}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.contactUs}</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${siteConfig.links.email}`}
                className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.links.email}
              </a>
              <a
                href={`tel:${siteConfig.links.phone}`}
                className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
              >
                <Phone className="h-4 w-4" />
                {siteConfig.links.phone}
              </a>
              <div className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{siteConfig.links.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
            <p>
              &copy; {currentYear} {siteConfig.name}. {t.footer.rights}
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:underline">
                {t.footer.privacy}
              </Link>
              <Link href="/terms" className="hover:underline">
                {t.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
