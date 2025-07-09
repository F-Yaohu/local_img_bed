# Stage 1: Build the Spring Boot backend
FROM maven:3.8-openjdk-17 AS backend-builder
WORKDIR /app

# First, copy pom.xml and download dependencies to leverage Docker's layer cache.
COPY pom.xml .
RUN mvn dependency:go-offline

# Then, copy the rest of the source code.
COPY .mvn ./.mvn
COPY mvnw .
COPY src ./src

# Package the application.
RUN mvn package -DskipTests

# Stage 2: Create the final, minimal runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the executable JAR from the builder stage
COPY --from=backend-builder /app/target/*.jar app.jar
# Expose the port the application runs on
EXPOSE 8198
# Run the application and activate the 'docker' profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]