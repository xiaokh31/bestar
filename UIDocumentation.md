# Bestar Logistics UI 定制操作指南

## 概述

本指南详细介绍了如何定制 Bestar Logistics 网站的用户界面，包括主题定制、组件修改、样式调整等操作。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS v4.x
- **组件库**: Shadcn/ui
- **图标**: Lucide React
- **国际化**: 自定义 i18n 实现

## 目录结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── globals.css         # 全局样式
│   └── layout.tsx          # 根布局
├── components/             # 可复用组件
│   ├── layout/             # 布局组件 (Header, Footer)
│   ├── marketing/          # 营销组件 (Hero, Features, etc.)
│   ├── ui/                 # Shadcn UI 组件
│   └── forms/              # 表单组件
├── config/                 # 配置文件
│   └── site.ts             # 站点配置
├── i18n/                   # 国际化配置
│   ├── locales/            # 多语言资源
│   └── index.ts            # 国际化工具
└── lib/                    # 工具库
    └── utils.ts            # 工具函数 (cn 函数等)
```

## 主题定制

### 1. 颜色主题

在 `tailwind.config.ts` 中定义颜色主题：

```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 2. 字体定制

在 `src/app/globals.css` 中添加自定义字体：

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', sans-serif;
}

body {
  font-family: var(--font-family);
}
```

### 3. 暗色模式

在 `tailwind.config.ts` 中启用暗色模式：

```typescript
export default {
  darkMode: "class", // 或 "media" 用于系统偏好
  // ... 其他配置
}
```

在组件中使用暗色模式：

```tsx
export function MyComponent() {
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* 内容 */}
    </div>
  );
}
```

## 组件定制

### 1. Shadcn UI 组件修改

所有 Shadcn UI 组件位于 `src/components/ui/` 目录下，可以根据需要进行定制。

例如，修改按钮组件 `src/components/ui/button.tsx`：

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // 添加新变体
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 2. 营销组件定制

营销组件如 Hero Section、Features Section 等位于 `src/components/marketing/` 目录。

例如，修改 Hero Section `src/components/marketing/hero-section.tsx`：

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-context";
import Link from "next/link";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-800 text-white">
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link href="/contact">
                {t.hero.ctaPrimary}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-transparent border-2 border-white hover:bg-white/10">
              <Link href="/services">
                {t.hero.ctaSecondary}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/20 to-transparent"></div>
      </div>
    </section>
  );
}
```

## 布局定制

### 1. 头部导航 (Header)

位于 `src/components/layout/header.tsx`，包含导航菜单、语言切换和用户菜单。

定制示例 - 添加新的导航项：

```tsx
// 在 mainNav 数组中添加新项
const mainNav = [
  // ... 现有项
  {
    title: t.nav.products, // 需要在翻译文件中添加此字段
    href: "/products",
  },
  // ... 其他项
];
```

### 2. 页脚 (Footer)

位于 `src/components/layout/footer.tsx`，可以根据需要添加或修改内容。

## 表单定制

### 1. 联系表单

位于 `src/components/forms/contact-form.tsx`，使用 Zod 进行验证。

添加新字段的示例：

```tsx
// 在 Zod schema 中添加新字段
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  // 添加新字段
  company: z.string().optional(),
});

// 在表单中添加新输入字段
<FormField
  control={form.control}
  name="company"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{t.forms.company}</FormLabel>
      <FormControl>
        <Input placeholder={t.forms.companyPlaceholder} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## 国际化定制

### 1. 添加新语言

1. 在 `src/i18n/locales/` 目录下创建新语言文件，如 `es.json`（西班牙语）
2. 在 `src/i18n/index.ts` 中注册新语言
3. 在语言切换器中添加新语言选项

### 2. 添加新翻译键

在 `en.json`、`zh.json`、`fr.json` 等文件中添加新键值对：

```json
{
  "newSection": {
    "title": "New Section Title",
    "description": "Description for the new section"
  }
}
```

在组件中使用：

```tsx
export function NewSection() {
  const { t } = useLocale();
  
  return (
    <div>
      <h2>{t.newSection.title}</h2>
      <p>{t.newSection.description}</p>
    </div>
  );
}
```

## 响应式设计

### 1. 断点配置

Tailwind CSS 默认断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 2. 响应式组件

使用 Tailwind 的响应式前缀：

```tsx
export function ResponsiveComponent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 内容在小屏幕上单列显示，在中等屏幕上双列，在大屏幕上三列 */}
      <div className="p-4 bg-white rounded-lg shadow-sm md:col-span-2 lg:col-span-1">
        {/* 内容 */}
      </div>
    </div>
  );
}
```

## 动画效果

### 1. CSS 动画

在 `src/app/globals.css` 中添加自定义动画：

```css
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-left {
  animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

在组件中使用：

```tsx
export function AnimatedComponent() {
  return (
    <div className="fade-in slide-in-left">
      {/* 内容 */}
    </div>
  );
}
```

### 2. Framer Motion (可选)

如果需要更复杂的动画，可以安装并使用 Framer Motion：

```bash
npm install framer-motion
```

```tsx
import { motion } from "framer-motion";

export function AnimatedHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1>动画标题</h1>
    </motion.div>
  );
}
```

## 图片和媒体

### 1. Next.js Image 优化

使用 Next.js 的 Image 组件进行图片优化：

```tsx
import Image from "next/image";

export function OptimizedImage() {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Hero Image"
      width={1200}
      height={600}
      className="w-full h-auto rounded-lg"
      priority={true} // 对于首屏图片使用 priority
    />
  );
}
```

### 2. 视频背景

在 Hero Section 中添加视频背景：

```tsx
export function HeroWithVideo() {
  return (
    <div className="relative h-screen overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">标题</h1>
          <p className="text-xl mb-8">描述文字</p>
        </div>
      </div>
    </div>
  );
}
```

## 性能优化

### 1. 组件懒加载

对于非关键路径的组件使用懒加载：

```tsx
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

export function PageWithLazyComponent() {
  return (
    <div>
      <h1>主要内容</h1>
      <Suspense fallback={<div>加载中...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

### 2. 图片懒加载

Next.js Image 组件默认支持懒加载，也可以手动设置：

```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy" // 默认值，可选 eager
/>
```

## 最佳实践

### 1. 组件结构

- 保持组件小而专注
- 使用 TypeScript 定义明确的接口
- 合理使用 React hooks
- 避免不必要的重渲染

### 2. 样式组织

- 使用 Tailwind CSS 实用优先的类名
- 避免自定义 CSS（除非必要）
- 使用 CSS 变量保持一致性
- 遵循 BEM 命名规范（如果需要自定义类）

### 3. 可访问性

- 使用语义化 HTML 元素
- 添加适当的 ARIA 属性
- 确保键盘导航可用
- 提供足够的颜色对比度

### 4. 测试

- 为组件编写单元测试
- 使用 Storybook 进行组件开发
- 进行端到端测试
- 定期进行可访问性测试

## 部署注意事项

### 1. 环境变量

确保在生产环境中正确设置环境变量：

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RESEND_API_KEY=your_resend_api_key
```

### 2. 构建优化

在 `next.config.ts` 中进行构建优化：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ["lh3.googleusercontent.com"], // 如果使用 Google 登录
  },
};

export default nextConfig;
```

## 故障排除

### 1. 样式不生效

- 检查 Tailwind 类名是否正确
- 确认 `tailwind.config.ts` 配置正确
- 检查 CSS 文件是否正确导入

### 2. 组件不渲染

- 检查 TypeScript 类型定义
- 确认组件导入路径正确
- 检查依赖项是否正确安装

### 3. 国际化问题

- 确认翻译文件格式正确
- 检查语言代码是否匹配
- 验证上下文提供者是否正确包裹

通过遵循本指南，您可以有效地定制 Bestar Logistics 网站的用户界面，满足特定的业务需求和设计要求。