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

# First, copy pom.xml and download dependencies to leverage Docker's layer cache.
# This layer is only rebuilt when pom.xml changes.
COPY pom.xml .
RUN mvn dependency:go-offline

# Then, copy the rest of the source code and the built frontend.
COPY .mvn ./.mvn
COPY mvnw .
COPY src ./src
COPY --from=frontend-builder /app/frontend/build ./src/main/resources/static

# Package the application. This will now use the cached dependencies and be much faster.
RUN mvn package -DskipTests

# Stage 3: Create the final, minimal runtime image
FROM openjdk:11-ea-17-jre-slim
WORKDIR /app
# Copy the executable JAR from the builder stage
COPY --from=backend-builder /app/target/*.jar app.jar
# Expose the port the application runs on
EXPOSE 8198
# Run the application and activate the 'docker' profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]