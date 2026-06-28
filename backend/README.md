# RescueNet-AI Backend

RescueNet-AI is a premium, state-of-the-art disaster coordination and relief management system. It provides real-time reporting, volunteer mobilization, resource allocation, temporary shelter monitoring, NGO registration, and analytical insights. Built using **Spring Boot**, **Spring Security (JWT)**, **Spring Data JPA**, and **MySQL**.

---

## Features & Services

- **Authentication & Security**: Secure user registration and login with roles (`ROLE_USER`, `ROLE_VOLUNTEER`, `ROLE_NGO`, `ROLE_ADMIN`) using JWT token-based authentication.
- **Disaster Reports**: Submit and track disaster occurrences with geographic coordinates (latitude, longitude), severity levels (LOW, MEDIUM, HIGH, CRITICAL), and status updates.
- **Volunteer Coordination**: Extended volunteer profiles specifying skills, tracking availability, and dispatching volunteers to urgent emergency SOS requests.
- **NGO Linkage**: Register organizations to coordinate relief distributions.
- **Resource Management**: Track supplies (water, food, medical kits, blankets) including quantities and statuses (AVAILABLE, ALLOCATED, REQUESTED).
- **Shelter Monitoring**: Manage shelter capacity, occupancy rates, and statuses.
- **Notifications**: Broadcast alerts, request configurations, and update notifications.
- **Analytics & Logs**: Compilation of overall dashboard metrics and detailed admin audit activity logs.

---

## Tech Stack

- **Core**: Java 21, Spring Boot (Web, Security, JPA, Validation)
- **Database**: MySQL (supported via Hibernate auto-ddl generation)
- **Authentication**: JSON Web Tokens (JJWT)
- **Documentation**: OpenAPI 3.0 / Swagger UI (Springdoc)

---

## Project Structure

```
rescuenet-backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── rescuenet/
│   │   │           ├── config/           # CORS & OpenAPI settings
│   │   │           ├── controller/       # REST Controllers
│   │   │           ├── dto/              # Request / Response DTOs
│   │   │           ├── entity/           # JPA Entities
│   │   │           ├── exception/        # Exception handlers
│   │   │           ├── repository/       # JpaRepositories
│   │   │           ├── security/         # JWT filter and security chain
│   │   │           ├── service/          # Business logic layers
│   │   │           ├── util/             # Constants and helpers
│   │   │           └── RescueNetApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties    # DB and JWT parameters
│   │       ├── static/
│   │       └── templates/
│
├── pom.xml
└── README.md
```

---

## API Documentation (Swagger)

Once the application is running, you can access the interactive API docs to test all endpoints:
- Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- API Specs: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Endpoints Overview

| Area | HTTP Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Register a new user account | No | Any |
| | POST | `/api/auth/login` | Login and obtain JWT token | No | Any |
| **Users** | GET | `/api/users` | List all system users | Yes | ADMIN |
| | GET | `/api/users/me` | Fetch active user profile details | Yes | Any |
| | PUT | `/api/users/{id}/status` | Enable/Disable user account | Yes | ADMIN |
| **Disasters** | POST | `/api/disasters` | Report a new disaster occurrence | Yes | Any |
| | GET | `/api/disasters` | Get list of all reports | Yes | Any |
| | PUT | `/api/disasters/{id}/status` | Update disaster resolution status | Yes | Any |
| **Resources**| POST | `/api/resources` | Register new relief supplies | Yes | Any |
| | GET | `/api/resources` | List all registered resources | Yes | Any |
| | PUT | `/api/resources/{id}/quantity`| Update supply stock quantity | Yes | Any |
| **Shelters** | POST | `/api/shelters` | Setup a new temporary shelter | Yes | Any |
| | GET | `/api/shelters` | List all shelters | Yes | Any |
| | PUT | `/api/shelters/{id}/occupancy`| Update shelter housing count | Yes | Any |
| **Volunteers**| POST | `/api/volunteers/register`| Create volunteer profile for active user| Yes| Any |
| | GET | `/api/volunteers` | List all volunteers | Yes | Any |
| | POST | `/api/volunteers/emergency-requests`| Report an SOS emergency request | Yes | Any |
| | PUT | `/api/volunteers/emergency-requests/{requestId}/assign`| Assign volunteer to help request | Yes | Any |
| **NGOs** | POST | `/api/ngos/register` | Create NGO profile for active user | Yes | Any |
| | GET | `/api/ngos` | List all NGOs | Yes | Any |
| **Notifications**| GET | `/api/notifications/my` | Retrieve active user alerts list | Yes | Any |
| | PUT | `/api/notifications/{id}/read`| Mark alert as read | Yes | Any |
| **Analytics**| GET | `/api/analytics/metrics`| Retrieve aggregate dashboard statistics| Yes| Any |
| | GET | `/api/analytics/logs` | List admin activity audit logs | Yes | ADMIN |

---

## Setup Instructions

### Prerequisites
1. **Java JDK 21** installed.
2. **Maven 3.8+** installed.
3. **MySQL Server** running.

### 1. Database Setup
Create a schema in your MySQL server:
```sql
CREATE DATABASE rescuenet_db;
```

### 2. Configuration
Review and configure connection settings in [application.properties](file:///c:/Users/sunit/OneDrive/Desktop/Project/RescueNet-AI/backend/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rescuenet_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Build & Run
Compile the application to generate resources and verify compile safety:
```bash
mvn clean compile
```

Run the application:
```bash
mvn spring-boot:run
```
The server will start on [http://localhost:8080](http://localhost:8080).
All tables will be created automatically on the first boot thanks to `spring.jpa.hibernate.ddl-auto=update`.
