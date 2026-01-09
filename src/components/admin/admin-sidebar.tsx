"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings,
  Newspaper,
  Home,
  Bell,
  FileText,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/i18n/locale-context";
import { canAccessModule, AdminModule, UserRole } from "@/lib/permissions";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  module: AdminModule;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { data: session } = useSession();
  
  const userRole = (session?.user?.role || 'CUSTOMER') as UserRole;
  const canManageArticles = session?.user?.canManageArticles || false;

  // 定义所有管理模块
  const allNavItems: NavItem[] = [
    {
      title: t.admin?.overview || "概览",
      href: "/admin",
      icon: LayoutDashboard,
      module: 'overview',
    },
    {
      title: t.admin?.articles || "文章管理",
      href: "/admin/articles",
      icon: Newspaper,
      module: 'articles',
    },
    {
      title: t.admin?.quotes || "询价管理",
      href: "/admin/quotes",
      icon: MessageSquare,
      module: 'quotes',
    },
    {
      title: t.admin?.users || "用户管理",
      href: "/admin/users",
      icon: Users,
      module: 'users',
    },
    {
      title: t.admin?.messages || "消息管理",
      href: "/admin/messages",
      icon: Bell,
      module: 'messages',
    },
    {
      title: t.admin?.pages?.title || "页面管理",
      href: "/admin/pages",
      icon: FileText,
      module: 'pages',
    },
    {
      title: t.admin?.settings || "系统设置",
      href: "/admin/settings",
      icon: Settings,
      module: 'settings',
    },
  ];

  // 根据用户角色过滤可访问的菜单项
  const filteredNavItems = allNavItems.filter(item => 
    canAccessModule(userRole, item.module, canManageArticles)
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-muted/30 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">{t.admin?.title || "管理后台"}</h2>
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
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
          {t.admin?.backToSite || "返回前台"}
        </Link>
      </div>
    </aside>
  );
}
