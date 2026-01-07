"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Newspaper,
  Home,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/i18n/locale-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const adminNavItems = [
    {
      title: t.admin.overview,
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t.admin.articles,
      href: "/admin/articles",
      icon: Newspaper,
    },
    {
      title: t.admin.quotes,
      href: "/admin/quotes",
      icon: MessageSquare,
    },
    {
      title: t.admin.users,
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "消息管理",
      href: "/admin/messages",
      icon: Bell,
    },
    {
      title: t.admin.settings,
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-muted/30 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">{t.admin.title}</h2>
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <Separator className="my-4" />
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          {t.admin.backToSite}
        </Link>
      </div>
    </aside>
  );
}
