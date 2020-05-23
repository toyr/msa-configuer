FROM openjdk:alpine
WORKDIR /root
COPY {{JOB_NAME}}.jar app.jar
COPY application.properties app.properties
EXPOSE 8080
CMD java -jar app.jar --spring.config.location=app.properties
