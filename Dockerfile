FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -B -Dmaven.test.skip=true -Dmaven.wagon.http.retryHandler.count=3 package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/restoconnect-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
