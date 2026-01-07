# Bestar Logistics 角色管理系统文档

## 概述

Bestar Logistics 角色管理系统基于 NextAuth.js 和 Prisma 实现，支持多角色权限控制，包括用户、管理员和超级管理员角色。

## 数据库模型

### 用户模型 (User)

在 `prisma/schema.prisma` 中定义：

```prisma
model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  emailVerified DateTime?
  image        String?
  password     String?
  role         String   @default("USER") // USER, ADMIN, SUPER_ADMIN
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  accounts     Account[]
  sessions     Session[]
}
```

### 角色说明

- `USER`: 普通用户，只能访问个人中心功能
- `ADMIN`: 管理员，可以管理文章、询价和普通用户
- `SUPER_ADMIN`: 超级管理员，拥有所有权限，包括系统设置

## 认证配置

### NextAuth 配置

在 `src/lib/auth.ts` 中配置：

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("邮箱和密码不能为空");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("邮箱或密码错误");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
```

## 权限控制实现

### 服务器端权限控制

创建权限检查工具函数 `src/lib/auth.ts`：

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function requireAuth(req: any) {
  const session = await getServerSession(req, undefined, authOptions);
  if (!session) {
    throw new Error("未授权访问");
  }
  return session;
}

export async function requireRole(req: any, allowedRoles: string[]) {
  const session = await requireAuth(req);
  const userRole = session.user.role;
  
  if (!allowedRoles.includes(userRole)) {
    throw new Error("权限不足");
  }
  
  return session;
}

export function hasRole(user: any, roles: string[]) {
  return roles.includes(user.role);
}
```

### 客户端权限控制

创建权限检查组件 `src/components/auth/withAuth.tsx`：

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface WithAuthProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export function WithAuth({ allowedRoles = ["USER", "ADMIN", "SUPER_ADMIN"], children }: WithAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && !allowedRoles.includes(session.user.role)) {
      router.push("/unauthorized");
    }
  }, [status, session, allowedRoles, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
```

## API 路由权限控制

### 用户管理 API

`src/app/api/admin/users/route.ts`：

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req, undefined, authOptions);
    
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return new Response("未授权", { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(users);
  } catch (error) {
    return new Response("服务器错误", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req, undefined, authOptions);
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return new Response("未授权", { status: 401 });
    }

    const { userId, role } = await req.json();
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    return new Response("服务器错误", { status: 500 });
  }
}
```

## 管理员界面

### 用户管理页面

`src/app/admin/users/page.tsx`：

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/i18n/locale-context";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLocale();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        router.push("/unauthorized");
        return;
      }
      
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // 重新获取用户列表
      }
    } catch (error) {
      console.error("更新用户角色失败:", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="container py-8">加载中...</div>;
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.users.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{t.admin.users.name}</th>
                  <th className="text-left py-2">{t.admin.users.email}</th>
                  <th className="text-left py-2">{t.admin.users.role}</th>
                  <th className="text-left py-2">{t.admin.users.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2">{user.name || "N/A"}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">
                      <Badge variant="outline">
                        {user.role === "USER" ? t.admin.users.user : 
                         user.role === "ADMIN" ? t.admin.users.admin : 
                         t.admin.users.superAdmin}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {session?.user.role === "SUPER_ADMIN" && (
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">{t.admin.users.user}</SelectItem>
                            <SelectItem value="ADMIN">{t.admin.users.admin}</SelectItem>
                            <SelectItem value="SUPER_ADMIN">{t.admin.users.superAdmin}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 创建超级管理员

### 方法一：数据库直接操作

通过 Prisma CLI 创建超级管理员：

```bash
npx prisma db seed
```

或直接在数据库中执行：

```sql
UPDATE User 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@example.com';
```

### 方法二：API 端点

创建一个临时的 API 端点来创建超级管理员（仅在开发环境中使用）：

`src/app/api/admin/create-super-admin/route.ts`：

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // 仅在开发环境中启用
  if (process.env.NODE_ENV !== "development") {
    return new Response("仅在开发环境中可用", { status: 403 });
  }

  const { name, email, password } = await req.json();

  try {
    // 检查是否已存在超级管理员
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingSuperAdmin) {
      return new Response("超级管理员已存在", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    return Response.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return new Response("创建超级管理员失败", { status: 500 });
  }
}
```

### 方法三：环境变量配置

在 `.env` 文件中配置默认超级管理员信息：

```env
# 默认超级管理员邮箱（仅用于开发环境）
DEFAULT_SUPER_ADMIN_EMAIL=admin@bestar.com
```

## 权限验证组件

创建权限验证组件 `src/components/auth/RoleGuard.tsx`：

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (!allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
      }
    }
  }, [status, session, allowedRoles, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (status === "authenticated" && session?.user) {
    const userRole = session.user.role;
    if (!allowedRoles.includes(userRole)) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}
```

## 使用示例

### 在页面中使用权限控制

```tsx
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="container py-8">
        <h1>管理员面板</h1>
        {/* 管理员功能内容 */}
      </div>
    </RoleGuard>
  );
}
```

### 在组件中检查权限

```tsx
"use client";

import { useSession } from "next-auth/react";

export function AdminOnlyComponent() {
  const { data: session } = useSession();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return null; // 或者返回无权限提示
  }

  return <div>管理员专属内容</div>;
}
```

## 安全注意事项

1. **始终在服务器端验证权限**：客户端权限检查仅用于UI控制，不能作为安全边界
2. **敏感操作需要额外验证**：如删除用户、修改权限等操作需要额外的安全验证
3. **定期审查权限分配**：确保权限分配符合业务需求
4. **日志记录**：记录权限相关操作以便审计

## 扩展性

该角色系统设计为可扩展，可以轻松添加新的角色类型和权限级别：

```typescript
// 可能的扩展角色
const ROLES = {
  USER: "USER",           // 普通用户
  ADMIN: "ADMIN",         // 管理员
  SUPER_ADMIN: "SUPER_ADMIN", // 超级管理员
  CUSTOMER: "CUSTOMER",   // 企业客户
  PARTNER: "PARTNER",     // 合作伙伴
  STAFF: "STAFF",         // 员工
};
```

## 总结

Bestar Logistics 角色管理系统提供了灵活的权限控制机制，支持多角色管理，可以满足不同业务场景的需求。系统采用 NextAuth.js 进行身份验证，Prisma 进行数据库操作，确保了系统的安全性和可扩展性。