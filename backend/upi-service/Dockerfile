FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . .
RUN mvn -q -pl upi-service -am clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/upi-service/target/upi-service-1.0.0.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","app.jar"]
