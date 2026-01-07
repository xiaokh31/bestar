# Bestar Logistics 项目介绍

## 项目概述

Bestar Logistics（百世达物流）是一个专业的跨境物流企业官网与业务管理系统，采用现代化全栈架构开发，旨在为跨境电商卖家提供高效、可靠的物流解决方案。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.x | React 全栈框架，支持 SSR/SSG |
| TypeScript | 5.x | 强类型语言，提高代码质量 |
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| Shadcn UI | Latest | 企业级 UI 组件库 |
| Prisma | 6.x | 数据库 ORM |
| NextAuth.js | 4.x | 用户认证系统 |
| PostgreSQL | 15+ | 关系型数据库 |

---

## 第一期：企业官网展示

### 完成状态：✅ 已完成

### 功能模块

#### 1. 首页 (/)
- Hero Section 视频背景区域（预留）
- 动态数字统计展示（服务客户、日处理订单、仓储面积、服务年限）
- 核心服务卡片展示
- 企业优势展示
- CTA 行动召唤区域

#### 2. 服务页面 (/services)
- 服务总览页面
- FBA头程服务详情 (/services/fba)
  - 海运、空运、快递多渠道介绍
  - 服务优势与特点
- 一件代发服务详情 (/services/dropshipping)
  - 智能仓储、快速处理、灵活配送
  - 支持平台展示
- 退货换标服务详情 (/services/returns)
  - 完整处理流程展示
  - 服务内容介绍

#### 3. 关于我们 (/about)
- 公司介绍
- 使命、愿景、价值观
- 企业优势
- 发展历程时间线

#### 4. 新闻动态 (/news)
- 新闻列表页面
- 分类标签展示

#### 5. 联系/询价 (/contact)
- 完整的询价表单（Zod 验证）
- 联系信息展示
- 地图位置预留

#### 6. 用户认证
- 登录页面 (/login)
- 注册页面 (/register)
- NextAuth.js 集成（开发模式）

#### 7. 后台预留
- Dashboard 页面框架 (/dashboard)

### 项目结构

```
bestar/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── public/                    # 静态资源
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── layout.tsx         # 根布局
│   │   ├── globals.css        # 全局样式
│   │   ├── about/             # 关于我们
│   │   ├── contact/           # 联系询价
│   │   ├── dashboard/         # 控制台
│   │   ├── login/             # 登录
│   │   ├── register/          # 注册
│   │   ├── news/              # 新闻动态
│   │   ├── services/          # 服务页面
│   │   │   ├── page.tsx       # 服务总览
│   │   │   ├── fba/           # FBA头程
│   │   │   ├── dropshipping/  # 一件代发
│   │   │   └── returns/       # 退货换标
│   │   ├── user/              # 用户中心（第二期）
│   │   │   ├── layout.tsx     # 用户中心布局
│   │   │   ├── page.tsx       # 用户中心首页
│   │   │   ├── profile/       # 个人信息
│   │   │   ├── password/      # 密码修改
│   │   │   ├── quotes/        # 我的询价
│   │   │   └── settings/      # 账户设置
│   │   ├── admin/             # 管理后台（第二期）
│   │   │   ├── layout.tsx     # 后台布局
│   │   │   ├── page.tsx       # 概览仪表板
│   │   │   ├── articles/      # 文章管理
│   │   │   │   ├── page.tsx   # 文章列表
│   │   │   │   └── new/       # 新建文章
│   │   │   ├── quotes/        # 询价管理
│   │   │   ├── users/         # 用户管理
│   │   │   └── settings/      # 系统设置
│   │   └── api/               # API 路由
│   │       ├── auth/          # 认证 API
│   │       ├── quote/         # 询价 API
│   │       └── contact/       # 联系 API
│   ├── components/
│   │   ├── ui/                # Shadcn UI 组件
│   │   │   ├── button.tsx     # 按钮
│   │   │   ├── card.tsx       # 卡片
│   │   │   ├── table.tsx      # 数据表格
│   │   │   ├── tabs.tsx       # 标签页
│   │   │   ├── avatar.tsx     # 头像
│   │   │   ├── badge.tsx      # 徽章
│   │   │   ├── switch.tsx     # 开关
│   │   │   ├── dropdown-menu.tsx # 下拉菜单
│   │   │   └── ...            # 其他 UI 组件
│   │   ├── layout/            # 布局组件
│   │   │   ├── header.tsx     # 网站头部
│   │   │   ├── footer.tsx     # 网站页脚
│   │   │   └── index.ts       # 导出
│   │   ├── marketing/         # 营销组件
│   │   ├── forms/             # 表单组件
│   │   ├── user/              # 用户组件（第二期）
│   │   │   ├── user-sidebar.tsx  # 用户侧边栏
│   │   │   └── index.ts
│   │   └── admin/             # 管理组件（第二期）
│   │       ├── admin-sidebar.tsx # 管理侧边栏
│   │       └── index.ts
│   ├── config/
│   │   └── site.ts            # 站点配置
│   ├── i18n/
│   │   ├── index.ts           # 国际化配置
│   │   └── locales/           # 语言包 (zh, en)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth 配置
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── utils.ts           # 工具函数
│   │   └── validations.ts     # Zod 验证
│   └── types/
│       ├── index.ts           # 类型定义
│       └── next-auth.d.ts     # NextAuth 类型扩展
├── .env.example               # 环境变量模板
├── projectIntroduction.md     # 项目介绍文档
├── developmentLog.md          # 开发日志
├── UserManual.md              # 用户手册
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 第二期：用户中心与动态内容

### 完成状态：✅ 已完成

### 功能模块

#### 1. 用户中心 (/user)
- 用户中心布局与侧边栏导航
- 个人信息管理 (/user/profile)
  - 头像展示、基本信息编辑
  - 联系方式管理
- 密码修改 (/user/password)
  - 当前密码验证
  - 新密码确认机制
- 我的询价 (/user/quotes)
  - 询价历史列表
  - 状态筛选与分页
- 账户设置 (/user/settings)
  - 通知偏好设置
  - 安全设置
  - 账户注销选项

#### 2. 管理后台 (/admin)
- 管理后台布局与侧边栏导航
- 概览仪表板 (/admin)
  - 统计卡片（用户数、文章数、询价数、营收）
  - 最近活动列表
- 文章管理 (/admin/articles)
  - 文章列表展示
  - 新建文章 (/admin/articles/new)
  - 分类与状态管理
- 询价管理 (/admin/quotes)
  - 询价列表与状态过滤
  - 详情查看与操作
- 用户管理 (/admin/users)
  - 用户列表与角色筛选
  - 用户状态管理
- 系统设置 (/admin/settings)
  - 网站基本设置
  - 联系信息配置
  - 安全设置

---

## 第三期：物流对接

### 完成状态：⏳ 待开发

### 规划功能

#### 1. 物流商 API 对接
- FedEx API 集成
- UPS API 集成
- Canada Post API 集成

#### 2. 运单管理
- 运单生成（ZPL/PDF Label）
- 运费计算
- 实时追踪

#### 3. 仓储管理
- 库存管理
- 入库/出库操作
- 库存预警

---

## 第四期：B2B 系统扩展

### 完成状态：⏳ 待开发

### 规划功能

#### 1. 多角色权限系统
- 管理员
- 仓库管理员
- 财务人员
- B2B 客户

#### 2. 客户管理
- 企业客户档案
- 合同管理
- 账期管理

#### 3. 订单系统
- 批量订单处理
- 订单状态流转
- 对账与结算

#### 4. 数据分析
- 业务报表
- 运营分析
- 导出功能

---

## 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- PostgreSQL 15+ (生产环境)
- 推荐使用 VS Code 开发

---

## 快速开始

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd bestar

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 生成 Prisma 客户端
npx prisma generate

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看项目

---

## 联系方式

- 项目维护：Bestar Logistics 开发团队
- 更新日期：2026年1月
