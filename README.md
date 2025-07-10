
# Local Image Bed - 本地个人图床

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Docker](https://img.shields.io/badge/Docker-blue)

这是一个功能完善的个人图床应用，基于 Spring Boot 和 React 技术栈构建。它允许用户轻松上传、管理和分类自己的图片资源，并提供稳定可靠的图片外链服务。项目支持使用 Docker 进行一键部署，极大简化了环境配置的复杂性。

## ✨ 功能特性

- **图片上传**：支持拖拽、点击选择等多种方式上传图片，并实时显示上传进度。
- **分类管理**：支持树状分类结构，可以方便地对图片进行归类整理。
- **图片管理**：以瀑布流形式展示图片，支持图片的预览、复制链接、删除等操作。
- **相似图片查找**：提供查找相似图片的功能（需要额外配置）。
- **响应式设计**：前端界面适配不同尺寸的设备。
- **容器化部署**：提供 `Dockerfile` 和 `docker-compose.yml`，支持一键部署。

## 🛠️ 技术栈

- **后端**
  - **核心框架**: Spring Boot 3.3.1
  - **数据库**: MySQL 8.0
  - **ORM**: MyBatis-Plus
  - **安全**: Spring Security, JWT
  - **HTTP客户端**: OkHttp
- **前端**
  - **核心框架**: React 18.3.1
  - **UI 库**: Ant Design
  - **HTTP客户端**: Axios
- **部署**
  - **容器化**: Docker, Docker Compose
  - **Web 服务器**: Nginx

## 🚀 快速开始

你可以选择本地运行，也可以使用 Docker Compose 一键部署。

### 1. Docker Compose (推荐)

这是最简单的启动方式，请确保你已经安装了 Docker 和 Docker Compose。

1.  **修改配置**
    - 修改 `docker-compose.yml` 中的 `JWT_SECRET` 、`ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。
    - （可选）如果需要，可以修改 `src/main/resources/application-docker.yaml` 中的数据库连接信息，确保与 `docker-compose.yml` 中定义的一致。

2.  **构建并启动**
    在项目根目录下执行：
    ```bash
    docker-compose up --build -d
    ```

3.  **访问应用**
    - **前端**: `http://localhost:8080`
    - **后端 API**: `http://localhost:8080/api`

### 2. 本地开发环境运行

**环境要求:**
- Java 17+
- Maven 3.6+
- Node.js 16+
- MySQL 5.7.40+

**步骤:**

1.  **数据库初始化**
    - 创建一个名为 `local_img_bed` 的数据库。
    - 将 `mysql-init-scripts/local_img_bed.sql` 文件导入到你创建的数据库中。

2.  **后端配置与启动**
    - 修改 `src/main/resources/application-local.yaml` 中的数据库连接信息（用户名和密码）。
    - 在项目根目录下，使用 Maven 启动后端服务：
      ```bash
      # 激活 local profile
      ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
      ```
    - 服务将运行在 `http://localhost:8888`。

3.  **前端配置与启动**
    - 进入 `frontend` 目录：
      ```bash
      cd frontend
      ```
    - 安装依赖：
      ```bash
      npm install
      ```
    - 启动前端开发服务器：
      ```bash
      npm start
      ```
    - 前端将运行在 `http://localhost:3000`。此时前端会通过 `package.json` 中的 `proxy` 配置将 API 请求转发到 `http://localhost:8888`。

## 📁 项目结构

```
.
├── frontend/              # React 前端项目
│   ├── public/
│   └── src/
│       ├── components/    # React 组件
│       ├── pages/         # 页面
│       └── services/      # API 服务
├── src/main/              # Spring Boot 后端项目
│   ├── java/
│   │   └── com/example/local_img_bed/
│   │       ├── config/    # 配置类
│   │       ├── controller/# 控制器
│   │       ├── entity/    # 实体类
│   │       ├── mapper/    # MyBatis Mapper
│   │       └── service/   # 业务逻辑
│   └── resources/
│       ├── mapper/        # MyBatis XML
│       └── application.yaml # 配置文件
├── docker-compose.yml     # Docker 编排文件
├── Dockerfile             # 后端 Dockerfile
└── nginx/                 # Nginx 配置和 Dockerfile
```

## 🤝 贡献

欢迎提交 Pull Request 或 Issue 来为项目做出贡献！
