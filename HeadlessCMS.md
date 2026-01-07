# Headless CMS 集成指南

本项目支持三种内容管理方式：本地数据库、Sanity CMS 和 Contentful CMS。您可以根据需要选择使用其中一种或多种。

## 目录

1. [概述](#概述)
2. [配置说明](#配置说明)
3. [Sanity CMS 配置](#sanity-cms-配置)
4. [Contentful CMS 配置](#contentful-cms-配置)
5. [本地数据库模式](#本地数据库模式)
6. [切换 CMS 提供商](#切换-cms-提供商)
7. [API 使用说明](#api-使用说明)
8. [常见问题](#常见问题)

---

## 概述

### 支持的 CMS 提供商

| 提供商 | 特点 | 适用场景 |
|--------|------|----------|
| **本地 (Local)** | 使用 Prisma + PostgreSQL | 完全自主控制，无外部依赖 |
| **Sanity** | 实时协作，强大的查询语言 | 需要团队协作的项目 |
| **Contentful** | 企业级，多语言支持好 | 大型多语言网站 |

### 功能对比

| 功能 | 本地 | Sanity | Contentful |
|------|------|--------|------------|
| 文章管理 | ✅ | ✅ | ✅ |
| 实时预览 | ❌ | ✅ | ✅ |
| 协作编辑 | ❌ | ✅ | ✅ |
| 版本历史 | ❌ | ✅ | ✅ |
| 免费额度 | 无限制 | 有限制 | 有限制 |

---

## 配置说明

### 环境变量配置

在项目根目录的 `.env` 或 `.env.local` 文件中配置以下变量：

```bash
# CMS 提供商选择 (可选值: local, sanity, contentful)
NEXT_PUBLIC_CMS_PROVIDER=local

# Sanity 配置
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_write_token  # 用于创建/更新内容

# Contentful 配置
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_PREVIEW_TOKEN=your_preview_token  # 可选，用于预览未发布内容
```

---

## Sanity CMS 配置

### 步骤 1: 创建 Sanity 项目

1. 访问 [Sanity.io](https://www.sanity.io/) 并注册账户
2. 创建新项目：
   ```bash
   npm create sanity@latest
   ```
3. 记录项目 ID 和数据集名称

### 步骤 2: 配置 Schema

在 Sanity Studio 中创建 `article` schema：

```javascript
// schemas/article.js
export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text'
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Company News', value: 'company' },
          { title: 'Industry', value: 'industry' },
          { title: 'Service', value: 'service' },
          { title: 'Policy', value: 'policy' }
        ]
      }
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'DRAFT' },
          { title: 'Published', value: 'PUBLISHED' },
          { title: 'Archived', value: 'ARCHIVED' }
        ]
      },
      initialValue: 'DRAFT'
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }
  ]
}
```

### 步骤 3: 获取 API Token

1. 进入 Sanity 项目管理页面
2. 转到 Settings > API > Tokens
3. 创建新 Token，选择 "Editor" 权限
4. 将 Token 添加到环境变量 `SANITY_API_TOKEN`

### 步骤 4: 部署 Sanity Studio

```bash
cd sanity-studio
npx sanity deploy
```

---

## Contentful CMS 配置

### 步骤 1: 创建 Contentful 账户和 Space

1. 访问 [Contentful.com](https://www.contentful.com/) 并注册账户
2. 创建新 Space
3. 记录 Space ID

### 步骤 2: 创建 Content Model

在 Contentful 中创建 `Article` 内容模型：

| 字段名 | 类型 | 必填 |
|--------|------|------|
| title | Short text | ✅ |
| slug | Short text | ✅ |
| excerpt | Long text | ✅ |
| content | Long text | ✅ |
| coverImage | Media | ❌ |
| author | Short text | ✅ |
| category | Short text | ✅ |
| tags | Short text, list | ❌ |
| status | Short text | ✅ |
| publishedAt | Date and time | ❌ |

### 步骤 3: 获取 API Keys

1. 进入 Settings > API keys
2. 创建新的 API key
3. 记录以下信息：
   - Space ID
   - Content Delivery API - access token
   - Content Preview API - access token (可选)

### 步骤 4: 配置环境变量

```bash
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
```

---

## 本地数据库模式

### 使用 Prisma 管理文章

本地模式使用项目内置的 Prisma + PostgreSQL 数据库：

1. 确保数据库已配置：
   ```bash
   npx prisma db push
   ```

2. 生成 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

3. 使用 Prisma Studio 管理数据：
   ```bash
   npx prisma studio
   ```

### 本地模式优势

- 无外部依赖
- 完全数据控制
- 无 API 调用限制
- 更快的响应速度

---

## 切换 CMS 提供商

### 方法 1: 通过环境变量

修改 `.env.local` 文件：

```bash
# 使用本地数据库
NEXT_PUBLIC_CMS_PROVIDER=local

# 使用 Sanity
NEXT_PUBLIC_CMS_PROVIDER=sanity

# 使用 Contentful
NEXT_PUBLIC_CMS_PROVIDER=contentful
```

重启开发服务器使配置生效。

### 方法 2: 运行时检查

在代码中可以检查当前 CMS 状态：

```typescript
import { getCMSStatus } from '@/lib/cms';

const status = getCMSStatus();
console.log(status);
// {
//   provider: 'local',
//   isConfigured: true,
//   sanityConfigured: false,
//   contentfulConfigured: false
// }
```

---

## API 使用说明

### 导入 CMS 模块

```typescript
import {
  getAllArticles,
  getPublishedArticles,
  getArticleBySlug,
  getArticleById,
  getArticlesByCategory,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getCMSStatus
} from '@/lib/cms';
```

### 查询文章

```typescript
// 获取所有已发布文章
const articles = await getPublishedArticles();

// 按 slug 获取文章
const article = await getArticleBySlug('my-article');

// 按分类获取文章
const categoryArticles = await getArticlesByCategory('company');

// 搜索文章
const searchResults = await searchArticles('物流');
```

### 创建文章

```typescript
const newArticle = await createArticle({
  title: '新文章标题',
  slug: 'new-article-slug',
  excerpt: '文章摘要...',
  content: '文章正文内容...',
  author: '作者名称',
  category: 'company',
  tags: ['物流', '新闻'],
  status: 'DRAFT',
});
```

### 更新文章

```typescript
const updated = await updateArticle('article-id', {
  title: '更新后的标题',
  status: 'PUBLISHED',
  publishedAt: new Date(),
});
```

### 删除文章

```typescript
await deleteArticle('article-id');
```

---

## 常见问题

### Q: 如何同时使用多个 CMS？

可以使用聚合查询功能：

```typescript
import { getArticlesFromAllSources } from '@/lib/cms';

// 从所有已配置的 CMS 获取文章
const allArticles = await getArticlesFromAllSources();
```

### Q: CMS 配置不完整怎么办？

系统会自动回退到本地数据库模式，并在控制台输出警告信息。

### Q: 如何处理 CMS API 错误？

所有 CMS 操作都应该用 try-catch 包装：

```typescript
try {
  const articles = await getPublishedArticles();
} catch (error) {
  console.error('获取文章失败:', error);
  // 处理错误...
}
```

### Q: Sanity 和 Contentful 的免费额度是多少？

| 服务 | 免费额度 |
|------|----------|
| Sanity | 10GB 资产存储, 100K API 请求/月 |
| Contentful | 5,000 条记录, 10 用户 |

### Q: 如何迁移数据？

可以编写脚本使用统一的 CMS API 进行数据迁移：

```typescript
// 从本地迁移到 Sanity
import * as local from '@/lib/cms/local';
import * as sanity from '@/lib/cms/sanity';

const articles = await local.getAllArticles();
for (const article of articles) {
  await sanity.createArticle(article);
}
```

---

## 技术支持

如有问题，请联系技术团队或查看项目文档。
