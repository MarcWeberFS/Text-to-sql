FROM eclipse-temurin:17-jdk as builder
WORKDIR /app
COPY . .
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_CONFIG_LOCATION=classpath:/application.properties

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
