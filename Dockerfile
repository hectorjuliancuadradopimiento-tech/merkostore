# =========================================================================
# Multi-stage Dockerfile for Merkostore API (Spring Boot 3 + Java 21)
# =========================================================================

# Stage 1: Build JAR using Maven with Temurin OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and pre-fetch dependencies (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build production executable JAR skipping unit tests
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure Alpine runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S merkogroup && adduser -S merko -G merkogroup
USER merko

# Copy built artifact from builder stage
COPY --from=build /app/target/merkostore-api-1.0.0-SNAPSHOT.jar app.jar

# Render dynamic port configuration
ENV PORT=8085
EXPOSE 8085

# Run application with optimized container flags
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
