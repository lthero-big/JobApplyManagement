# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖（包括开发依赖，因为我们需要构建）
RUN npm ci

# 复制应用源代码
COPY . .

# 构建应用
RUN npm run build

# 安装 PostgreSQL 客户端用于数据库初始化
RUN apk add --no-cache postgresql-client

# 暴露端口
EXPOSE 8080

# 启动应用（使用 preview 而不是 dev）
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
