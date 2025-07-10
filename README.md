
# Local Image Bed - 本地个人图床

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MySQL](https://img.shields.io/badge/MySQL-5.7.40-orange)
![Docker](https://img.shields.io/badge/Docker-blue)

这是一个功能完善的个人图床应用，基于 Spring Boot 和 React 技术栈构建。它允许用户轻松上传、管理和分类自己的图片资源，并提供稳定可靠的图片外链服务。项目支持使用 Docker 进行一键部署，极大简化了环境配置的复杂性。

## ✨ 功能特性

- **图片上传**：支持拖拽、点击选择等多种方式上传图片，并实时显示上传进度。
- **分类管理**：支持树状分类结构，可以方便地对图片进行归类整理。
- **图片管理**：以瀑布流形式展示图片，支持图片的预览、复制链接、删除等操作。
- **相似图片查找**：提供查找相似图片的功能（需要额外配置）。
- **响应式设计**：前端界面适配不同尺寸的设备。
- **容器化部署**：提供 `Dockerfile` 和 `docker-compose.yml`，支持一键部署。

## 📸 预览

| 主页面                                                                                                                                                  | 分类管理 |
|------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| ![主界面预览](https://raw.githubusercontent.com/F-Yaohu/local_img_bed/refs/heads/master/%E9%A2%84%E8%A7%88%E5%9B%BE/2577a4f481980a4570423e413e840869.png) | ![分类管理预览](https://raw.githubusercontent.com/F-Yaohu/local_img_bed/refs/heads/master/%E9%A2%84%E8%A7%88%E5%9B%BE/13aaac6c010242f213e63ded3822a830.png) |
| **系统设置**                                                                                                                                             | **图片预览** |
| ![系统设置](https://raw.githubusercontent.com/F-Yaohu/local_img_bed/refs/heads/master/%E9%A2%84%E8%A7%88%E5%9B%BE/65d51195e84fd97f711e931d397b4a9f.png)  | ![图片预览](https://raw.githubusercontent.com/F-Yaohu/local_img_bed/refs/heads/master/%E9%A2%84%E8%A7%88%E5%9B%BE/623f4e675a14fbae68ffe2f61dc6faaf.png) |


## 🛠️ 技术栈

- **后端**
  - **核心框架**: Spring Boot 3.3.1
  - **数据库**: MySQL 5.7.40
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

### 1. Docker Compose (本地构建)

这是最简单的启动方式，适用于希望本地构建镜像的用户。请确保你已经安装了 Docker 和 Docker Compose。

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

### 2. Docker Compose (生产环境/预构建镜像)

此方式适用于希望直接拉取预构建镜像（后端 `app` 和前端 `frontend`）的用户，无需本地构建。Nginx 镜像将会在本地构建，因为它包含了自定义配置。

1.  **前提条件**
    请确保你已经安装了 Docker 和 Docker Compose。

2.  **创建 `docker-compose.prod.yml` 文件**
    在你的部署目录下创建一个名为 `docker-compose.prod.yml` 的文件，并将以下内容复制粘贴到文件中：

    ```yaml
    version: '3.8'

    services:
      mysql: # 根据自己的需求，可以使用本地自己的mysql ≥ 5.7.40，该配置可以去掉
        image: mysql:5.7.40
        container_name: local_img_bed_mysql
        restart: always
        environment:
          MYSQL_ROOT_PASSWORD: your_mysql_root_password # 你的数据库root密码
          MYSQL_DATABASE: local_img_bed # 数据库名
          MYSQL_USER: local_img_bed_user  # 数据库用户
          MYSQL_PASSWORD: your_mysql_password # 数据库密码
        ports:
          - "13336:3306" # MySQL端口映射，左侧为宿主机端口，右侧为容器端口，可修改宿主机端口
        volumes:
          - ./data/mysql:/var/lib/mysql # 持久化MySQL数据到宿主机当前目录下的data/mysql文件夹，如果需要，请修改为其他地址，默认为 ./data/mysql

      app: # 后端服务
        image: zy1234567/local_img_bed-app:latest
        container_name: local_img_bed_app
        restart: always
        environment:
          - DB_URL=jdbc:mysql://mysql:3306/local_img_bed?useSSL=false&serverTimezone=Asia/Shanghai # 数据库连接URL，如果MySQL服务名或端口有变动，请修改
          - DB_USERNAME=local_img_bed_user # 数据库用户，和上面数据库配置保持一致
          - DB_PASSWORD=your_mysql_password # 数据库密码，和上面数据库配置保持一致
          - JWT_SECRET=${JWT_SECRET}  # JWT密钥，建议长度≥32字符，请修改为自己的
          - ADMIN_USERNAME=${ADMIN_USERNAME} # 管理员登录账号，请修改
          - ADMIN_PASSWORD=${ADMIN_PASSWORD} # 管理员登录密码，请修改
          - IMAGE_STORAGE_ROOT_PATH=/data/images # 告知Spring Boot容器内的图片路径，通常无需修改
        volumes:
          - ./data/images:/data/images # 将图片存储在宿主机当前目录下的data/images文件夹，如果需要，请修改为自己本地存储磁盘，默认为 ./data/images
        depends_on:
          - mysql

      frontend: # 前端服务
        image: zy1234567/local_img_bed-frontend:latest
        container_name: local_img_bed_frontend
        restart: always

      nginx-proxy: # nginx
        image: zy1234567/local_img_bed-nginx-proxy:latest # 使用已经打包好的nginx是因为里面添加了接口转发和图片查看的的配置文件，不用手动配置
        container_name: local_img_bed_nginx_proxy
        restart: always
        ports:
          - "8198:80" # Nginx端口映射，左侧为宿主机端口，右侧为容器端口，可修改宿主机端口以避免冲突
        volumes:
          - ./data/images:/var/www/images:ro # 以只读方式挂载图片卷，供Nginx读取，路径与app服务保持一致
        depends_on:
          - app
          - frontend
    ```

3.  **配置环境变量**
    在 `docker-compose.prod.yml` 所在的目录下，创建一个 `.env` 文件，并设置以下环境变量：
    ```
    MYSQL_ROOT_PASSWORD=your_mysql_root_password # 你的数据库root密码
    MYSQL_DATABASE=local_img_bed # 数据库名
    MYSQL_USER=local_img_bed_user  # 数据库用户
    MYSQL_PASSWORD=your_mysql_password # 数据库密码
    JWT_SECRET=your_jwt_secret_key # JWT密钥，建议长度≥32字符
    ADMIN_USERNAME=your_admin_username # 管理员登录账号
    ADMIN_PASSWORD=your_admin_password # 管理员登录密码
    ```
    **重要提示：** 请务必将 `your_...` 替换为你的实际值。

4.  **启动服务**
    在 `docker-compose.prod.yml` 文件所在的目录下行：
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
    此命令会拉取 `app` 和 `frontend` 的预构建镜像，并在本地构建 `nginx-proxy` 镜像。

5.  **访问应用**
    - **前端**: `http://localhost:8198`
    - **后端 API**: `http://localhost:8198/api`
    （请注意，端口已更改为 `8198` 以避免与默认 `8080` 冲突，这在 `docker-compose.prod.yml` 中已配置）

6.  **数据库初始化注意事项**
    后端 `app` 服务会在首次启动时自动初始化数据库表结构。如果需要重新初始化数据库（例如，从头开始），请在启动服务之前删除 `mysql_data` Docker 卷：
    ```bash
    docker-compose -f docker-compose.prod.yml down -v
    ```
    然后再次运行。

### 3. 本地开发环境运行

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
├── docker-compose.yml     # Docker 编排文件 (本地构建)
├── docker-compose.prod.yml # Docker 编排文件 (生产环境/预构建镜像)
├── Dockerfile             # 后端 Dockerfile
└── nginx/                 # Nginx 配置和 Dockerfile
```

## 🤝 贡献

欢迎提交 Pull Request 或 Issue 来为项目做出贡献！
