FROM nginx:1.25-alpine

# 移除默认的Nginx配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制我们自定义的配置文件
COPY nginx.conf /etc/nginx/nginx.conf
