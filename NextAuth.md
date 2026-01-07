# NextAuth.js 集成文档

## 概述

本项目使用 NextAuth.js 作为身份验证解决方案，提供了灵活的身份验证机制，支持多种认证方式（用户名/密码、Google OAuth等）。

## 配置文件

### 1. 主配置文件
- **路径**: `src/lib/auth.ts`
- **功能**: 包含 NextAuth.js 的完整配置选项

### 2. 配置选项详解

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // 允许链接已存在的邮箱账户
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 自定义认证逻辑
      },
    }),
  ],
  session: {
    strategy: "jwt", // 使用 JWT 作为会话策略
  },
  callbacks: {
    // JWT 和会话回调处理
  },
  pages: {
    signIn: "/login", // 自定义登录页面
    error: "/login",  // 错误页面
  },
};
```

## 认证方式

### 1. 用户名/密码认证

#### 配置详情
- **Provider**: `CredentialsProvider`
- **认证流程**:
  1. 用户提交邮箱和密码
  2. 从数据库查询用户
  3. 使用 bcrypt 验证密码
  4. 返回用户信息或抛出错误

#### 安全措施
- 密码使用 bcrypt 进行哈希存储
- 输入验证防止注入攻击
- 错误信息模糊化以防止账户枚举

### 2. Google OAuth 认证

#### 配置详情
- **Provider**: `GoogleProvider`
- **功能**: 允许用户使用 Google 账户登录

#### 环境变量配置
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

#### 设置步骤
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 配置授权域名:
   - 本地开发: `http://localhost:3000`
   - 生产环境: `https://yourdomain.com`
6. 配置认证 URI:
   - 本地: `http://localhost:3000/api/auth/callback/google`
   - 生产: `https://yourdomain.com/api/auth/callback/google`

## 数据库适配器

### Prisma 适配器
- **包**: `@auth/prisma-adapter`
- **功能**: 将 NextAuth.js 与 Prisma ORM 集成
- **支持的模型**:
  - User
  - Account
  - Session
  - VerificationToken

## 会话管理

### JWT 策略
- **类型**: JWT (JSON Web Token)
- **优点**: 无状态，可扩展
- **配置**: `session.strategy = "jwt"`

### 回调函数

#### JWT 回调
```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role;  // 添加用户角色到令牌
    token.id = user.id;      // 添加用户ID到令牌
  }
  return token;
}
```

#### 会话回调
```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.role = token.role as string;  // 从令牌添加角色到会话
    session.user.id = token.id as string;      // 从令牌添加ID到会话
  }
  return session;
}
```

## API 路由

### 认证 API
NextAuth.js 自动创建以下 API 路由:
- `POST /api/auth/signin` - 登录
- `POST /api/auth/signout` - 登出
- `GET /api/auth/session` - 获取会话
- `GET /api/auth/csrf` - CSRF 令牌
- `GET /api/auth/providers` - 可用认证提供者

### 自定义 API
- **注册路由**: `src/app/api/auth/register/route.ts`
- **功能**: 处理用户注册请求

## 前端集成

### 会话 Hook
```typescript
import { useSession, signIn, signOut } from "next-auth/react";

// 获取会话信息
const { data: session, status } = useSession();

// 检查登录状态
const isLoggedIn = status === "authenticated";

// 登录
await signIn("credentials", { email, password });

// Google 登录
await signIn("google");

// 登出
await signOut({ callbackUrl: '/' });
```

### 会话提供者
- **位置**: `src/app/layout.tsx`
- **功能**: 在应用根级别提供会话上下文

## 角色管理

### 用户角色
- **ADMIN**: 管理员
- **STAFF**: 员工
- **CUSTOMER**: 客户

### 角色检查
```typescript
// 检查管理员权限
const isAdmin = session?.user?.role === "ADMIN";
```

## 环境变量

### 必需的环境变量
```env
# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 数据库连接
DATABASE_URL="your_database_url"
```

## 安全考虑

### 1. 密钥管理
- 使用强随机字符串作为 `NEXTAUTH_SECRET`
- 在生产环境中妥善保管所有密钥
- 定期轮换密钥

### 2. 会话安全
- JWT 自动签名和验证
- 会话过期时间可配置
- CSRF 保护自动启用

### 3. OAuth 安全
- 验证 OAuth 提供者的回调 URL
- 检查 OAuth 提供者返回的用户信息
- 防止账户劫持

## 错误处理

### 常见错误
- `CredentialsSignin`: 凭据认证失败
- `OAuthAccountNotLinked`: OAuth 账户未链接
- `Verification`: 验证令牌问题

### 自定义错误页面
- **路径**: `pages/api/auth/error.js` (Pages Router) 或自定义错误处理

## 开发与调试

### 开发模式注意事项
- 使用 `http://localhost:3000` 作为基础 URL
- 调试信息输出到控制台
- OAuth 重定向 URL 配置为本地地址

### 日志记录
- 认证过程中的关键事件
- 错误信息记录
- 用户活动审计（可选）

## 扩展功能

### 添加新的认证提供者
```typescript
import FacebookProvider from "next-auth/providers/facebook";

providers: [
  // ... 现有提供者
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
],
```

### 自定义用户模型
- 在 Prisma Schema 中扩展 User 模型
- 更新 NextAuth 配置以包含新字段
- 实现相应的回调函数处理新字段

## 最佳实践

### 1. 性能优化
- 使用 JWT 策略减少数据库查询
- 缓存会话信息
- 合理设置会话过期时间

### 2. 用户体验
- 提供清晰的错误信息
- 保持登录状态跨页面一致性
- 实现优雅的登出流程

### 3. 安全最佳实践
- 定期审查和更新依赖
- 监控异常登录尝试
- 实现双因素认证（可选）

## 故障排除

### 常见问题
1. **OAuth 登录失败**: 检查回调 URL 配置
2. **会话丢失**: 检查 CORS 设置和 Cookie 配置
3. **数据库连接问题**: 验证 Prisma 适配器配置

### 调试技巧
- 启用详细日志记录
- 检查网络请求和响应
- 验证环境变量配置