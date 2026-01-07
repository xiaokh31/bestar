# 资源管理指南 (Assets Management Guide)

本文档详细说明 Bestar Logistics 项目中前端资源（图片、视频、GIF等）的管理规范、存放位置和操作指南。

---

## 目录

1. [资源存放位置](#资源存放位置)
2. [Hero Section 视频背景](#hero-section-视频背景)
3. [网站头部 Logo](#网站头部-logo)
4. [图片资源管理](#图片资源管理)
5. [资源命名规范](#资源命名规范)
6. [性能优化建议](#性能优化建议)
7. [常见操作示例](#常见操作示例)

---

## 资源存放位置

### 目录结构

```
bestar/
├── public/                    # 静态资源根目录（可通过 / 直接访问）
│   ├── images/               # 图片资源
│   │   ├── logo/            # Logo 相关
│   │   │   ├── logo.png     # 主 Logo
│   │   │   ├── logo-white.png # 白色 Logo（用于深色背景）
│   │   │   └── favicon.ico  # 网站图标
│   │   ├── hero/            # Hero Section 图片
│   │   │   ├── hero-bg.jpg  # Hero 背景图
│   │   │   └── hero-logistics.jpg
│   │   ├── services/        # 服务相关图片
│   │   ├── about/           # 关于我们图片
│   │   └── team/            # 团队成员照片
│   ├── videos/              # 视频资源
│   │   ├── hero-bg.mp4      # Hero 背景视频
│   │   └── promotional.mp4  # 宣传视频
│   └── icons/               # 图标资源
│       └── ...
└── src/
    └── assets/              # 需要被 Webpack 处理的资源（可选）
```

### 访问路径

| 资源位置 | 访问路径 | 说明 |
|---------|---------|------|
| `public/images/logo.png` | `/images/logo.png` | 直接通过URL访问 |
| `public/videos/hero-bg.mp4` | `/videos/hero-bg.mp4` | 视频直接访问 |
| `src/assets/` | 需导入使用 | 支持优化和压缩 |

---

## Hero Section 视频背景

### 添加视频背景步骤

#### 1. 准备视频文件

将视频文件放入 `public/videos/` 目录：

```bash
# 推荐视频规格
- 格式：MP4 (H.264 编码)
- 分辨率：1920x1080 或更高
- 文件大小：建议不超过 10MB
- 时长：15-30 秒循环
```

#### 2. 修改 Hero Section 组件

编辑 `src/components/marketing/hero-section.tsx`：

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-context";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 视频背景 */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero/hero-poster.jpg" // 视频加载前显示的图片
      />
      
      {/* 渐变遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      
      {/* 内容区域 */}
      <div className="relative z-10 container flex items-center min-h-screen">
        <div className="max-w-2xl text-white py-20">
          <div className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full text-primary-foreground text-sm font-medium mb-6">
            {t.hero.badge}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t.hero.title1}
            <span className="text-primary"> {t.hero.title2} </span>
            {t.hero.title3}
          </h1>
          
          <p className="text-xl text-gray-200 mb-8">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/contact">
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/services">
                {t.hero.learnMore}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### 3. 添加响应式支持

为移动设备提供备选方案（图片替代视频）：

```tsx
export function HeroSection() {
  const { t } = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 移动端显示图片，桌面端显示视频 */}
      {isMobile ? (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero/hero-mobile.jpg')" }}
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {/* ... 其余内容 ... */}
    </section>
  );
}
```

---

## 网站头部 Logo

### 添加企业 Logo 步骤

#### 1. 准备 Logo 文件

将 Logo 文件放入 `public/images/logo/` 目录：

```bash
public/images/logo/
├── logo.png           # 主 Logo（透明背景，推荐 200x50px）
├── logo-white.png     # 白色 Logo（用于深色背景）
├── logo-dark.png      # 深色 Logo（用于浅色背景）
├── logo-icon.png      # 图标版 Logo（正方形，64x64px）
└── favicon.ico        # 网站图标（32x32px 或 16x16px）
```

#### 2. 修改 Header 组件

编辑 `src/components/layout/header.tsx`：

```tsx
import Image from "next/image";

export function Header() {
  // ... 其他代码 ...

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      {/* ... Top Bar ... */}
      
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - 使用 Next.js Image 组件优化 */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo/logo.png"
            alt="Bestar Logistics"
            width={160}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>
        
        {/* ... 其余导航内容 ... */}
      </div>
    </header>
  );
}
```

#### 3. 配置网站图标 (Favicon)

编辑 `src/app/layout.tsx`：

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bestar Logistics",
  description: "Professional Cross-Border Logistics Solutions",
  icons: {
    icon: [
      { url: "/images/logo/favicon.ico" },
      { url: "/images/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/images/logo/apple-touch-icon.png",
  },
};
```

#### 4. 深色/浅色模式 Logo 切换

```tsx
import { useTheme } from "next-themes";

export function Header() {
  const { theme } = useTheme();
  
  return (
    <Link href="/">
      <Image
        src={theme === "dark" ? "/images/logo/logo-white.png" : "/images/logo/logo.png"}
        alt="Bestar Logistics"
        width={160}
        height={40}
        priority
      />
    </Link>
  );
}
```

---

## 图片资源管理

### 使用 Next.js Image 组件

推荐使用 Next.js 内置的 `Image` 组件，自动优化图片：

```tsx
import Image from "next/image";

export function ServiceCard() {
  return (
    <div className="relative aspect-video">
      <Image
        src="/images/services/fba-service.jpg"
        alt="FBA First-Mile Service"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover rounded-lg"
        priority={false} // 首屏图片设为 true
      />
    </div>
  );
}
```

### 图片优化配置

编辑 `next.config.ts`：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 允许的外部图片域名
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "cdn.bestarlogistics.com",
      },
    ],
    // 图片格式优化
    formats: ["image/avif", "image/webp"],
    // 设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;
```

---

## 资源命名规范

### 文件命名规则

| 类型 | 命名格式 | 示例 |
|-----|---------|------|
| Logo | `logo-{variant}.{ext}` | `logo-white.png`, `logo-dark.svg` |
| Hero 图片 | `hero-{description}.{ext}` | `hero-logistics.jpg`, `hero-bg.mp4` |
| 服务图片 | `service-{name}.{ext}` | `service-fba.jpg`, `service-dropshipping.png` |
| 团队照片 | `team-{name}.{ext}` | `team-john-doe.jpg` |
| 图标 | `icon-{name}.{ext}` | `icon-shipping.svg` |

### 命名规范

1. **使用小写字母**：`hero-background.jpg` ✅ `Hero-Background.jpg` ❌
2. **使用连字符分隔**：`fba-service.png` ✅ `fba_service.png` ❌
3. **有意义的描述**：`hero-logistics-warehouse.jpg` ✅ `img001.jpg` ❌
4. **包含尺寸后缀**（可选）：`logo-160x40.png`, `hero-1920x1080.jpg`

---

## 性能优化建议

### 图片优化

```bash
# 安装图片优化工具
npm install sharp

# 推荐图片规格
- Hero 背景：1920x1080px, WebP/AVIF, < 200KB
- 服务卡片：800x600px, WebP, < 100KB
- 缩略图：400x300px, WebP, < 50KB
- Logo：SVG 格式优先，PNG 次选
```

### 视频优化

```bash
# 使用 FFmpeg 压缩视频
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -an output.mp4

# 推荐视频规格
- 格式：MP4 (H.264)
- 分辨率：1920x1080
- 帧率：24-30fps
- 码率：2-4 Mbps
- 时长：15-30秒
```

### 延迟加载

```tsx
// 非首屏图片使用 loading="lazy"
<Image
  src="/images/about/team.jpg"
  alt="Team"
  width={800}
  height={600}
  loading="lazy"
/>

// 首屏关键图片使用 priority
<Image
  src="/images/hero/hero-bg.jpg"
  alt="Hero"
  fill
  priority
/>
```

---

## 常见操作示例

### 添加新图片

```bash
# 1. 将图片文件复制到相应目录
cp ~/Downloads/new-service.jpg public/images/services/

# 2. 在组件中引用
import Image from "next/image";

<Image
  src="/images/services/new-service.jpg"
  alt="New Service"
  width={600}
  height={400}
/>
```

### 替换 Logo

```bash
# 1. 备份原有 Logo
mv public/images/logo/logo.png public/images/logo/logo-backup.png

# 2. 添加新 Logo
cp ~/Downloads/new-logo.png public/images/logo/logo.png

# 3. 清除缓存并重启开发服务器
npm run dev
```

### 添加视频背景

```bash
# 1. 压缩视频（可选）
ffmpeg -i original.mp4 -vcodec libx264 -crf 28 -an public/videos/hero-bg.mp4

# 2. 准备视频封面图
cp poster.jpg public/images/hero/hero-poster.jpg

# 3. 更新 Hero 组件（参考上方代码示例）
```

### 删除资源

```bash
# 1. 确认资源未被引用
grep -r "resource-name.jpg" src/

# 2. 删除文件
rm public/images/unused-resource.jpg

# 3. 提交更改
git add -A
git commit -m "Remove unused assets"
```

---

## 资源清单检查

定期运行以下命令检查未使用的资源：

```bash
# 查找 public 目录中的所有图片
find public -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.svg" -o -name "*.gif" \)

# 检查某个图片是否被引用
grep -r "image-name" src/
```

---

## 注意事项

1. **版权问题**：确保所有使用的图片和视频拥有合法授权
2. **文件大小**：监控资源文件大小，避免影响页面加载速度
3. **备份原文件**：在替换资源前，始终保留原文件备份
4. **测试响应式**：添加新资源后，在不同设备上测试显示效果
5. **Git 管理**：大型媒体文件考虑使用 Git LFS

---

## 相关文档

- [UIDocumentation.md](./UIDocumentation.md) - UI 定制指南
- [Next.js Image 优化](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [视频最佳实践](https://web.dev/efficient-animated-content/)

---

*最后更新：2026年1月*
