# PicklePass: Pickleball Court Finder and Match Queue System

## Project Overview
A web-based pickleball court locator and digital match queuing system built with ReactJS, Spring Boot, and a cloud-hosted relational database.

## Increment 1 Features Implemented
- **User Account Creation:** Registration for `PLAYER` and `ORGANIZER` roles with field validation, duplicate email prevention, and BCrypt password hashing.
- **User Login and Logout:** JWT-based authentication with invalid credential error handling and secure session termination upon logout.
- **Role-Based User Dashboards:** Protected frontend routes and Spring Security role checks separating Player and Court Organizer views.

## Setup and Execution Instructions

### 1. Database Configuration
This project connects to a cloud-hosted database instance (Aiven), so no local database installation is required. Tables are automatically created via Spring Data JPA (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Run the Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run