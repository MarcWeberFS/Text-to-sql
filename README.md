# Bachelorthesis

This project was done in combination with a bachelor thesis.

Link to the written bachelorthesis: [2025_Weber_Marc_BSC_WI.pdf](2025_Weber_Marc_BSC_WI.pdf)

Grade: 5.5

# Text-to-PostGIS

A webapp to convert natural language input into SQL queries for spatial databases with PostGIS. The webapp contains the saved queries to improve the responses, an interface to interact with the Text-to-SQL / PostGIS application and results of the Benchmark.

Live-Demo: [https://www.text-to-postgis.com](https://www.text-to-postgis.com)

---

## Requirements

Your local environment requires the following services or apps to run:

- Java JDK 17+
- Maven
- Node.js + npm
- PostgreSQL (v13+) with PostGIS-extention
- API-Keys for:
  - ChatGPT (OpenAI)
  - Claude
  - Deepseek
  - Gemini
  - Grok

---

## Backend Configuration

Under [text-to-sql/src/main/resources/application.properties](text-to-sql/src/main/resources/application.properties) are the following fields to be configured to fit your database and LLM endpoints.
```yaml
spring.application.name=text-to-sql
spring.datasource.url=jdbc:postgresql://localhost:5432/postgis_db
spring.datasource.username=postgres
spring.datasource.password=DEIN_PASSWORT
spring.jpa.database-platform=org.hibernate.spatial.dialect.postgis.PostgisPG95Dialect
spring.jpa.hibernate.ddl-auto=none

openai.api.key=sk-proj-...
gemini.api.key=AIz...
claude.api.key=sk-...
deepseek.api.key=sk-...
grok.api.key=xai-...
```

To start the app first do a clean, install on maven. Then click on run to start the application. Alternatively you can run the following commands inside of [text-to-sql/text-to-sql](text-to-sql) to start the app.
```cmd
cd text-to-sql
mvn clean install
mvn spring-boot:run
```

Backend runs on: [http://localhost:8080](http://localhost:8080)

API-Documentation: [https://www.postman.com](https://documenter.getpostman.com/view/26856010/2sB2j1hCkg)

Under [MainController.java](text-to-sql/src/main/java/ch/zhaw/text_to_sql/controller/MainController.java) there are three endpoint commented out, these functionalities are core to use the benchmark and removing accidentally favorited prompts and responses.

---

## Frontend Configuration

Under [text-to-sql-frontend/.env](text-to-sql-frontend/.env) make sure the base backend URL is set to: 
```yaml
REACT_APP_API_URL=http://localhost:8080
```

To start the frontend, run the following commands:
```cmd
cd text-to-sql-frontend
npm install
npm run start
```

Frontend runs on: [http://localhost:3000](http://localhost:3000)