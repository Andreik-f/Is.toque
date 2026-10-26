# Etapa 1: build - compila o projeto com Maven
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Etapa 2: runtime - so o jar rodando numa imagem enxuta
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/istoque-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
