# Bestar Logistics 用户手册

> 本手册旨在帮助开发人员快速上手项目的本地测试、数据库操作、打包发布及部署。

---

## 目录

1. [环境要求](#环境要求)
2. [本地开发环境搭建](#本地开发环境搭建)
3. [数据库配置与操作](#数据库配置与操作)
4. [项目启动与测试](#项目启动与测试)
5. [打包构建](#打包构建)
6. [部署指南](#部署指南)
7. [常见问题](#常见问题)

---

## 环境要求

| 环境 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18.x | 20.x LTS / 24.x |
| npm | 9.x | 10.x |
| PostgreSQL | 14.x | 15.x+ |
| Git | 2.x | 最新版 |

### Node.js v24 支持

本项目完全支持 Node.js v24.x 版本。如果您使用的是 v24 版本，可能会遇到 PowerShell 执行策略问题，请参考下方解决方案。

### Windows PowerShell 执行策略问题

如果在 Windows 下运行 `npm` 命令时出现“禁止运行脚本”错误，请执行以下解决方案：

```powershell
# 方案一：使用管理员权限打开 PowerShell，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 方案二：直接使用 npx.cmd 代替 npx
npx.cmd next dev
npx.cmd next build
npx.cmd prisma generate
npx.cmd prisma migrate dev

# 方案三：使用 CMD 而非 PowerShell
cmd /c "npm run dev"
```

### 推荐开发工具

- **IDE**: Visual Studio Code
- **VS Code 插件**:
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer

---

## 本地开发环境搭建

### 1. 克隆项目

```bash
git clone <repository-url>
cd bestar
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板并修改：

```bash
# Linux/Mac
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

编辑 `.env` 文件，配置以下必要变量：

```env
# 数据库连接（生产环境必须配置真实数据库）
DATABASE_URL="postgresql://username:password@localhost:5432/bestar_db?schema=public"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters"
```

### 4. 生成 Prisma 客户端

```bash
npx prisma generate
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看项目。

---

## 数据库配置与操作

### PostgreSQL 安装

#### Windows 详细安装指南

##### 1. 下载安装

1. 访问 [PostgreSQL 官网下载页面](https://www.postgresql.org/download/windows/)
2. 点击 "Download the installer" 下载 Windows 版安装程序
3. 运行安装程序，选择安装组件：
   - PostgreSQL Server（必选）
   - pgAdmin 4（可选，图形化管理工具）
   - Command Line Tools（必选）
4. 设置安装目录（默认：C:\Program Files\PostgreSQL\15）
5. 设置数据目录（默认：C:\Program Files\PostgreSQL\15\data）
6. **设置 postgres 用户密码**（请记住此密码！）
7. 设置端口（默认：5432）
8. 完成安装

##### 2. 配置环境变量（可选）

为了在命令行中使用 `psql`，需要将 PostgreSQL bin 目录添加到系统 PATH：

```powershell
# 临时添加到当前会话
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# 永久添加（需要管理员权限）
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\15\bin", "User")
```

##### 3. 验证安装

```powershell
# 检查 PostgreSQL 版本
psql --version

# 检查服务状态
pg_isready
```

##### 4. 为 Bestar 项目创建数据库

使用命令行：

```powershell
# 连接到 PostgreSQL（输入安装时设置的密码）
psql -U postgres

# 创建项目数据库
CREATE DATABASE bestar_db;

# 创建专用用户（推荐）
CREATE USER bestar_user WITH PASSWORD 'your_secure_password';

# 授予权限
GRANT ALL PRIVILEGES ON DATABASE bestar_db TO bestar_user;

# 连接到新数据库并授予 schema 权限
\c bestar_db
GRANT ALL ON SCHEMA public TO bestar_user;

# 退出
\q
```

或使用 pgAdmin：

1. 打开 pgAdmin 4
2. 右键点击 "Servers" > "Register" > "Server"
3. 输入服务器名称（如：Local PostgreSQL）
4. 在 "Connection" 选项卡中：
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: （安装时设置的密码）
5. 连接后，右键点击 "Databases" > "Create" > "Database"
6. 输入数据库名称：bestar_db
7. 点击 "Save"

##### 5. 配置项目环境变量

编辑项目根目录下的 `.env` 文件：

```env
# 使用 postgres 用户
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bestar_db?schema=public"

# 或使用专用用户
DATABASE_URL="postgresql://bestar_user:your_secure_password@localhost:5432/bestar_db?schema=public"
```

##### 6. 初始化数据库表结构

```powershell
# 进入项目目录
cd d:\works\logistics\bestar

# 生成 Prisma 客户端
npx.cmd prisma generate

# 创建数据库表结构（首次运行）
npx.cmd prisma migrate dev --name init

# 或使用 db push（开发阶段推荐）
npx.cmd prisma db push
```

##### 7. 验证数据库连接

```powershell
# 打开 Prisma Studio 查看数据库
npx.cmd prisma studio
```

浏览器会自动打开 http://localhost:5555，您可以查看和管理数据库表。

#### Mac (Homebrew) 详细安装指南

##### 1. 安装 Homebrew（如果尚未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

##### 2. 安装 PostgreSQL 18（最新版本）

```bash
# 更新 Homebrew
brew update

# 安装 PostgreSQL 18
brew install postgresql@18

# 如果安装的是旧版本，可以先卸载
brew uninstall postgresql@15
brew install postgresql@18
```

##### 3. 配置环境变量

```bash
# 将 PostgreSQL 18 添加到 PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc

# 如果使用 bash
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.bash_profile

# 立即生效
source ~/.zshrc
```

##### 4. 启动 PostgreSQL 服务

```bash
# 启动服务
brew services start postgresql@18

# 查看服务状态
brew services list

# 停止服务
brew services stop postgresql@18

# 重启服务
brew services restart postgresql@18
```

##### 5. 验证安装

```bash
# 检查版本
psql --version
# 应显示: psql (PostgreSQL) 18.x

# 检查服务状态
pg_isready
# 应显示: accepting connections
```

##### 6. 为 Bestar 项目创建数据库

```bash
# Mac 上默认使用当前用户名连接，无需密码
# 先创建 postgres 超级用户（如果不存在）
createuser -s postgres

# 连接到 PostgreSQL
psql postgres

# 创建项目数据库
CREATE DATABASE bestar_db;

# 创建专用用户（推荐）
CREATE USER bestar_user WITH PASSWORD 'your_secure_password';

# 授予权限
GRANT ALL PRIVILEGES ON DATABASE bestar_db TO bestar_user;

# 连接到新数据库并授予 schema 权限
\c bestar_db
GRANT ALL ON SCHEMA public TO bestar_user;

# 退出
\q
```

##### 7. 配置项目环境变量

编辑项目根目录下的 `.env` 文件：

```env
# Mac 上使用 postgres 用户（无密码）
DATABASE_URL="postgresql://postgres@localhost:5432/bestar_db?schema=public"

# 或使用专用用户
DATABASE_URL="postgresql://bestar_user:your_secure_password@localhost:5432/bestar_db?schema=public"
```

##### 8. 初始化数据库表结构

```bash
# 进入项目目录
cd ~/works/logistics/bestar  # 根据实际路径修改

# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表结构（首次运行）
npx prisma migrate dev --name init

# 或使用 db push（开发阶段推荐）
npx prisma db push
```

##### 9. 验证数据库连接

```bash
# 打开 Prisma Studio 查看数据库
npx prisma studio
```

浏览器会自动打开 http://localhost:5555，您可以查看和管理数据库表。

##### Mac 常见问题

**Q: 无法连接到 PostgreSQL**

```bash
# 检查服务是否运行
brew services list

# 重启服务
brew services restart postgresql@18
```

**Q: 端口被占用**

```bash
# 查看占用 5432 端口的进程
lsof -i :5432

# 终止进程
kill -9 <PID>
```

**Q: 升级到 PostgreSQL 18 后数据丢失**

```bash
# 迁移旧版本数据
brew postgresql-upgrade-database
```

#### Mac (官网安装) 详细指南

> 适用于通过官网下载安装包或 PostgreSQL.app 安装的用户

##### 1. 下载安装

**方式一：PostgreSQL.app（推荐）**

1. 访问 [PostgreSQL.app](https://postgresapp.com/)
2. 下载最新版本
3. 将应用拖入 Applications 文件夹
4. 打开应用，点击 "Initialize" 初始化数据库

**方式二：EDB 安装包**

1. 访问 [EDB 官网](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. 下载 macOS 版安装包
3. 运行安装程序，设置 postgres 用户密码
4. 默认安装路径：`/Library/PostgreSQL/18`

##### 2. 配置环境变量

**PostgreSQL.app:**

```bash
# 添加到 PATH
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**EDB 安装包:**

```bash
# 添加到 PATH
echo 'export PATH="/Library/PostgreSQL/18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

##### 3. 启动和停止服务

**PostgreSQL.app:**

```bash
# 启动服务（直接打开 Postgres.app 即可）
open -a Postgres

# 或使用命令行
/Applications/Postgres.app/Contents/Versions/latest/bin/pg_ctl -D ~/Library/Application\ Support/Postgres/var-18 start

# 停止服务
/Applications/Postgres.app/Contents/Versions/latest/bin/pg_ctl -D ~/Library/Application\ Support/Postgres/var-18 stop

# 重启服务
/Applications/Postgres.app/Contents/Versions/latest/bin/pg_ctl -D ~/Library/Application\ Support/Postgres/var-18 restart

# 查看服务状态
/Applications/Postgres.app/Contents/Versions/latest/bin/pg_ctl -D ~/Library/Application\ Support/Postgres/var-18 status
```

**EDB 安装包:**

```bash
# 启动服务
sudo /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data start

# 停止服务
sudo /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data stop

# 重启服务
sudo /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data restart

# 查看服务状态
sudo /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data status

# 或使用 launchctl（开机自启服务）
sudo launchctl load /Library/LaunchDaemons/com.edb.launchd.postgresql-18.plist  # 启动
sudo launchctl unload /Library/LaunchDaemons/com.edb.launchd.postgresql-18.plist  # 停止
```

##### 4. 验证安装

```bash
# 检查版本
psql --version

# 检查服务状态
pg_isready
```

##### 5. 创建数据库和用户

**PostgreSQL.app:**

```bash
# 默认使用当前 macOS 用户名连接
psql postgres

# 创建数据库
CREATE DATABASE bestar_db;

# 创建用户
CREATE USER bestar_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bestar_db TO bestar_user;
\c bestar_db
GRANT ALL ON SCHEMA public TO bestar_user;
\q
```

**EDB 安装包:**

```bash
# 使用 postgres 用户连接（需输入安装时设置的密码）
psql -U postgres

# 创建数据库
CREATE DATABASE bestar_db;

# 创建用户
CREATE USER bestar_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bestar_db TO bestar_user;
\c bestar_db
GRANT ALL ON SCHEMA public TO bestar_user;
\q
```

##### 6. 配置项目环境变量

编辑 `.env` 文件：

```env
# PostgreSQL.app（使用当前 macOS 用户名，无密码）
DATABASE_URL="postgresql://your_macos_username@localhost:5432/bestar_db?schema=public"

# EDB 安装包
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bestar_db?schema=public"

# 或使用专用用户
DATABASE_URL="postgresql://bestar_user:your_secure_password@localhost:5432/bestar_db?schema=public"
```

##### 7. 官网安装版常见问题

**Q: PostgreSQL.app 无法启动**

```bash
# 检查端口是否被占用
lsof -i :5432

# 如有其他进程占用，终止它
kill -9 <PID>

# 重新打开 PostgreSQL.app
```

**Q: EDB 安装后 psql 命令找不到**

```bash
# 确保 PATH 配置正确
echo $PATH | grep postgresql

# 如果没有，手动添加
export PATH="/Library/PostgreSQL/18/bin:$PATH"
```

**Q: 权限被拒绝**

```bash
# EDB 安装需要 sudo 权限
sudo -u postgres psql
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 创建数据库

```bash
# 进入 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE bestar_db;

# 创建用户（可选）
CREATE USER bestar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bestar_db TO bestar_user;

# 退出
\q
```

### Prisma 数据库操作

#### 迁移数据库（创建表结构）

```bash
# 开发环境：创建并应用迁移
npx prisma migrate dev --name init

# 生产环境：仅应用迁移
npx prisma migrate deploy
```

#### 重置数据库（清空所有数据）

```bash
npx prisma migrate reset
```

#### 查看数据库（Prisma Studio）

```bash
npx prisma studio
```

浏览器会自动打开 http://localhost:5555，可视化管理数据库。

### 数据库 CRUD 操作示例

#### 创建数据（Create）

```typescript
import { prisma } from '@/lib/prisma';

// 创建用户
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: '张三',
    password: 'hashed_password',
    role: 'CUSTOMER',
  },
});

// 创建询价
const quote = await prisma.quote.create({
  data: {
    name: '李四',
    email: 'lisi@example.com',
    company: 'ABC公司',
    phone: '13800138000',
    serviceType: 'FBA_SHIPPING',
    message: '需要FBA头程服务报价',
    userId: user.id,
  },
});
```

#### 查询数据（Read）

```typescript
// 查询所有用户
const users = await prisma.user.findMany();

// 条件查询
const adminUsers = await prisma.user.findMany({
  where: { role: 'ADMIN' },
});

// 关联查询
const userWithQuotes = await prisma.user.findUnique({
  where: { id: userId },
  include: { quotes: true },
});

// 分页查询
const paginatedQuotes = await prisma.quote.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' },
});
```

#### 更新数据（Update）

```typescript
// 更新单条记录
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { name: '新名字' },
});

// 批量更新
await prisma.quote.updateMany({
  where: { status: 'PENDING' },
  data: { status: 'PROCESSING' },
});
```

#### 删除数据（Delete）

```typescript
// 删除单条记录
await prisma.user.delete({
  where: { id: userId },
});

// 批量删除
await prisma.quote.deleteMany({
  where: { status: 'CANCELLED' },
});
```

### 数据库模型说明

查看 `prisma/schema.prisma` 文件了解完整的数据模型：

| 模型 | 说明 |
|------|------|
| User | 用户模型，支持多角色 |
| Quote | 询价记录 |
| Contact | 联系留言 |
| Article | 文章/新闻 |
| Account | OAuth 账户关联 |
| Session | 用户会话 |

---

## 项目启动与测试

### 开发模式

```bash
npm run dev
```

- 支持热重载（HMR）
- 默认端口：3000
- 访问地址：http://localhost:3000

### 测试账号（开发模式）

| 账号 | 密码 | 角色 |
|------|------|------|
| demo@bestar.com | demo123 | 普通用户 |

### 运行构建检查

```bash
npm run build
```

确保没有 TypeScript 错误和构建警告。

### 代码检查

```bash
npm run lint
```

---

## 打包构建

### 生产构建

```bash
npm run build
```

构建产物输出到 `.next` 目录。

### 预览生产构建

```bash
npm run build
npm run start
```

访问 http://localhost:3000 预览生产版本。

---

## 部署指南

### 方式一：Vercel 部署（推荐）

1. 注册 [Vercel](https://vercel.com) 账号
2. 连接 Git 仓库
3. 配置环境变量：
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. 点击 Deploy

### 方式二：Docker 部署

#### 创建 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 构建并运行

```bash
docker build -t bestar-app .
docker run -p 3000:3000 --env-file .env bestar-app
```

### 方式三：传统服务器部署

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 构建项目

```bash
npm run build
```

#### 3. 启动服务

```bash
pm2 start npm --name "bestar" -- start
```

#### 4. PM2 常用命令

```bash
pm2 list              # 查看运行状态
pm2 logs bestar       # 查看日志
pm2 restart bestar    # 重启服务
pm2 stop bestar       # 停止服务
pm2 delete bestar     # 删除服务
```

### 生产环境配置

#### next.config.ts 输出模式

```typescript
const nextConfig = {
  output: 'standalone', // 独立部署模式
};
```

#### 环境变量配置

确保生产环境配置以下变量：

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

---

## 常见问题

### Q: Prisma Client 报错 "PrismaClient is not generated"

**解决方案**：

```bash
npx prisma generate
```

### Q: 数据库连接失败

**检查项**：
1. PostgreSQL 服务是否启动
2. DATABASE_URL 格式是否正确
3. 数据库用户是否有权限

### Q: NextAuth 报错 "NEXTAUTH_SECRET must be set"

**解决方案**：
在 `.env` 文件中添加：

```env
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

生成安全密钥：

```bash
openssl rand -base64 32
```

### Q: 构建时 TypeScript 报错

**解决方案**：

```bash
npm run lint
npx tsc --noEmit
```

查看并修复所有类型错误。

### Q: 端口 3000 被占用

**解决方案**：

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

或使用其他端口：

```bash
PORT=3001 npm run dev
```

---

## 项目脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |
| `npm run prisma:generate` | 生成 Prisma 客户端 |
| `npm run prisma:migrate` | 数据库迁移 |
| `npm run prisma:studio` | 数据库可视化 |
| `npm run db:push` | 同步 Schema 到数据库 |
| `npx prisma studio` | 数据库可视化 |
| `npx prisma migrate dev` | 数据库迁移 |
| `npx prisma generate` | 生成 Prisma 客户端 |

---

*文档更新：2026年1月3日*
