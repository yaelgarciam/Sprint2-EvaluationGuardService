# EvaluationGuard Assignment #3

## Lo realizado en esta actividad
Se trabajó sobre la base ubicada en `TutorBot/tutorbot-campus/backend/evaluator-service` para ejecutar la actividad de `EvaluationGuardService` descrita en el documento. En la validación de la práctica se confirmó el flujo previo a la llamada a Ollama con:

- entidades `Skill`, `Topic` y `LearningPathEntity`
- excepciones de dominio para `TopicNotFound`, `TopicInactive`, `SkillInactive` y `StudentNotEnrolled`
- repositorios `TopicRepository` y `LearningPathRepository`
- `EvaluationGuardService` inyectado como primera línea dentro de `EvaluationService`
- `GlobalExceptionHandler` devolviendo `404` y `422`
- pruebas unitarias pasando correctamente

Escenarios verificados durante la ejecución:

- `topicId=9999` devuelve `404 Not Found`
- `topicId=16` devuelve `422 Unprocessable Entity`
- `topicId=15` devuelve `422 Unprocessable Entity`
- `studentId=STU999, topicId=1` devuelve `422 Unprocessable Entity`
- `studentId=A00835001, topicId=1` devuelve `201 Created`

## Comandos necesarios para correr el código

### 1. Levantar Oracle
```bash
cd TutorBot/tutorbot-campus/infrastructure
docker compose -f docker-compose-practice.yml up -d oracle-db
```

### 2. Cargar los scripts base
```bash
docker cp /Users/yaelgarciam/Sprint_2_Web/TutorBot/tutorbot-campus/infrastructure/oracle/V1__init_schema.sql oracledb:/tmp/V1__init_schema.sql
docker cp /Users/yaelgarciam/Sprint_2_Web/TutorBot/tutorbot-campus/infrastructure/oracle/V2__seed_data.sql oracledb:/tmp/V2__seed_data.sql
docker exec oracledb bash -lc "printf '@/tmp/V1__init_schema.sql\nEXIT;\n' | /opt/oracle/product/21c/dbhomeXE/bin/sqlplus -s Adolfo/password@//localhost:1521/XEPDB1"
docker exec oracledb bash -lc "printf '@/tmp/V2__seed_data.sql\nEXIT;\n' | /opt/oracle/product/21c/dbhomeXE/bin/sqlplus -s Adolfo/password@//localhost:1521/XEPDB1"
```

### 3. Ejecutar pruebas
```bash
cd /Users/yaelgarciam/Sprint_2_Web/TutorBot/tutorbot-campus/backend/evaluator-service
mvn test
```

### 4. Levantar el servicio
```bash
cd /Users/yaelgarciam/Sprint_2_Web/TutorBot/tutorbot-campus/backend/evaluator-service
mvn spring-boot:run -Dspring-boot.run.profiles=practice
```

### 4.1 Abrir la interfaz web
Con el servicio levantado, abre:

```text
http://localhost:8082/
```

### 4.2 Verificar salud del servicio
La interfaz consulta `GET /actuator/health` para saber si el backend está disponible.

```bash
curl -s http://localhost:8082/actuator/health
```

Respuesta esperada:

```json
{"status":"UP"}
```

Cuando ese endpoint responde `UP`, la tarjeta de la interfaz muestra `Disponible`. Si no responde o devuelve otro estado, la interfaz lo refleja como error o como un estado distinto.

### 5. Probar el endpoint principal
```bash
curl -s -i -X POST http://localhost:8082/api/v1/evaluations \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"SESSION-ASSIGNMENT-201","studentId":"A00835001","questionText":"¿Qué es HTML?","studentAnswer":"Es un lenguaje de marcado.","correctAnswer":"HTML es un lenguaje de marcado.","maxScore":100,"topicId":1}'
```

## Nota de ejecución
Para poder correr la práctica con esta copia local del repositorio, se tuvo que alinear temporalmente la base en ejecución porque los scripts `V1__init_schema.sql` y `V2__seed_data.sql` de esta carpeta no incluyen `SKILLS`, `LEARNING_PATHS` ni las columnas `ACTIVE` y `SKILL_ID` en `TOPICS`, aunque el documento de la actividad sí las da por existentes. No se modificaron esos scripts dentro del repositorio.

## Evidencias

### Pruebas unitarias
![Pruebas unitarias](docs/evidencias/tests-success.png)

### Servicio levantado
![Servicio levantado](docs/evidencias/service-up.png)

### Interfaz web
![Interfaz web](docs/evidencias/interface-web.png)

### Respuestas del guard
![Respuestas del guard](docs/evidencias/guard-responses.png)

## Autores
José Emilio Inzunza García | A01644973

Yael García Morelos | A01352461

Patricio Blanco Rafols | A01642057

Arturo Gómez Gómez | A07106692

Andrés Gallego López | A01645740
