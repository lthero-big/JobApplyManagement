# 多阶段构建 - 前端构建
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制前端相关文件
COPY package*.json ./
RUN npm ci

COPY . .

# 构建前端
RUN npm run build

# 最终镜像
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制后端代码
COPY server ./server

# 复制前端构建产物
COPY --from=frontend-builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动后端服务器（会同时服务前端静态文件）
CMD ["node", "server/server.js"]
