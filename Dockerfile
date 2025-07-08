# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.8-openjdk-17 AS backend-builder
WORKDIR /app
# Copy the built frontend assets from the first stage
COPY --from=frontend-builder /app/frontend/build ./src/main/resources/static
# Copy the backend source code
COPY pom.xml .
COPY .mvn ./.mvn
COPY mvnw .
COPY src ./src
# Build the JAR file
RUN mvn package -DskipTests

# Stage 3: Create the final, minimal runtime image
FROM openjdk:17-jre-slim
WORKDIR /app
# Copy the executable JAR from the builder stage
COPY --from=backend-builder /app/target/*.jar app.jar
# Expose the port the application runs on
EXPOSE 8198
# Run the application and activate the 'docker' profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]