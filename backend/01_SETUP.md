# backend/01_SETUP.md — Bootstrapping & Configuration

## 1. Project generation

Use Spring Initializr (or manual pom) with:
`spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-data-jpa`,
`spring-boot-starter-validation`, `postgresql`, `flyway-core` (+`flyway-database-postgresql`),
`lombok`, `springdoc-openapi-starter-webmvc-ui`, JWT lib (`io.jsonwebtoken:jjwt-api/impl/jackson`),
`mapstruct` + `mapstruct-processor` (optional — hand mappers acceptable),
test: `spring-boot-starter-test`, `spring-security-test`, `testcontainers-postgresql`.

Java 21, packaging jar, group `com.privhealth`, artifact `backend`.

## 2. application.yml (profiles)

```yaml
spring:
  application.name: privhealth-backend
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate.ddl-auto: validate
    open-in-view: false
  flyway:
    enabled: true

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-seconds: ${JWT_EXPIRATION_SECONDS:3600}
  crypto:
    aes-key: ${AES_KEY}
    hmac-key: ${HMAC_KEY}
  ml:
    base-url: ${ML_SERVICE_URL:http://localhost:8000}
    timeout-ms: 5000
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

`application-local.yml` may add dev defaults; `application-prod.yml` disables swagger,
hides exception details, sets `server.error.include-stacktrace: never`.

Bind `app.*` with `@ConfigurationProperties` classes (JwtProperties, CryptoProperties,
MlProperties, CorsProperties) — no `@Value` scattered around.

## 3. docker-compose.yml (repo root)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: privhealth
      POSTGRES_USER: privhealth
      POSTGRES_PASSWORD: privhealth
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

## 4. Core common classes (build first)

1. `common/response/ApiResponse<T>` + static factories `ok(data)`, `ok(message,data)`,
   `error(message, code, details)` + `PageMeta.from(Page<?>)`.
2. `common/exception/*`: domain exceptions + `GlobalExceptionHandler` mapping every
   exception type to the envelope per `API_CONTRACT.md §1` (incl.
   `MethodArgumentNotValidException` → field errors, `AccessDeniedException` → 403,
   fallback `Exception` → 500 `INTERNAL_ERROR` with sanitized message).
3. `config/swagger/OpenApiConfig` with bearer-auth security scheme.
4. `config/app/CorsConfig` reading allowed origins from properties.

## 5. Verification

- `./mvnw spring-boot:run` starts, Flyway applies V1+V2, `/swagger-ui.html` loads.
- Hitting unknown route returns the JSON error envelope (configure
  `ErrorController` or `NoHandlerFoundException` handling).
