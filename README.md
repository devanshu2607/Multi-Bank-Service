# Multi-Bank Digital Banking & UPI Ecosystem Simulation

This repo is now a **deployable microservice foundation** for a banking + UPI style system.

https://github.com/user-attachments/assets/fa1462e8-daf2-4210-993d-48c59c280202


https://github.com/user-attachments/assets/2ec4709a-b9f5-4930-8f82-9253a31bbd4d






It is not yet a finished production banking product, but it is no longer just a folder scaffold either. The backend now has real persistence-backed flows across the main services, while still staying simple enough to explain as a student-built project.

## Current architecture

Backend root:

- `C:\Users\dkoth\OneDrive\Documents\multi bank service\backend`

Services:

- `common-library`
- `auth-service`
- `user-service`
- `bank-service`
- `upi-service`
- `npci-service`
- `payment-service`
- `ledger-service`
- `notification-service`

Every service has:

- `controller`
- `dto`
- `entity`
- `repository`
- `service`
- `application.yml`
- `Dockerfile`
- `pom.xml`

Frontend stays separate in:

- `C:\Users\dkoth\OneDrive\Documents\multi bank service\frontend`

## What works now

### `auth-service`

- register user with email, phone, and password
- login with password verification
- store user records in database

### `user-service`

- create user profile
- fetch user profile by `authUserId`

### `bank-service`

- create bank account
- enforce max 3 accounts per user
- enforce one account per bank per user
- fetch account details
- list user accounts
- debit account
- credit account
- consume debit, credit, and refund requests from Kafka

### `upi-service`

- create UPI profile against a real bank account
- prevent duplicate UPI IDs
- prevent duplicate phone mapping
- resolve user by UPI ID
- resolve user by phone number

### `npci-service`

- accept routing requests
- resolve sender and receiver through `upi-service`
- return sender/receiver account + bank routing info
- persist routing mappings
- publish `PAYMENT_REQUESTED` to Kafka after route resolution

### `payment-service`

- call `npci-service` to start payment routing
- save payment transaction in database
- consume payment workflow events from Kafka
- publish debit, credit, refund, success, and failure events as Saga coordinator
- publish final ledger and notification events

### `ledger-service`

- create ledger entries
- fetch passbook / account ledger
- consume `ledger-events` and create debit/credit ledger rows

### `notification-service`

- create notifications
- fetch notifications by user
- consume `notification-events` and notify users

## Kafka usage

Kafka is used only for transaction processing workflows. Login, registration, profile updates, balance fetches, account details, and transaction history remain synchronous REST APIs.

Topics:

- `payment-events`
- `ledger-events`
- `notification-events`

`payment-events` carries the Saga workflow. Stages are identified by `eventType`:

- `PAYMENT_REQUESTED`
- `DEBIT_REQUESTED`
- `DEBIT_COMPLETED`
- `DEBIT_FAILED`
- `CREDIT_REQUESTED`
- `CREDIT_COMPLETED`
- `CREDIT_FAILED`
- `REFUND_REQUESTED`
- `REFUND_COMPLETED`
- `PAYMENT_COMPLETED`
- `PAYMENT_FAILED`

Producer and consumer responsibilities:

- `npci-service` produces `PAYMENT_REQUESTED` on `payment-events`
- `payment-service` consumes `PAYMENT_REQUESTED`, `DEBIT_COMPLETED`, `DEBIT_FAILED`, `CREDIT_COMPLETED`, `CREDIT_FAILED`, and `REFUND_COMPLETED`
- `payment-service` produces `DEBIT_REQUESTED`, `CREDIT_REQUESTED`, `REFUND_REQUESTED`, `PAYMENT_COMPLETED`, and `PAYMENT_FAILED` on `payment-events`
- `bank-service` consumes `DEBIT_REQUESTED`, `CREDIT_REQUESTED`, and `REFUND_REQUESTED`
- `bank-service` produces `DEBIT_COMPLETED`, `DEBIT_FAILED`, `CREDIT_COMPLETED`, `CREDIT_FAILED`, and `REFUND_COMPLETED`
- `payment-service` produces final `ledger-events` after success
- `ledger-service` consumes `ledger-events`
- `payment-service` produces final `notification-events` after success/failure
- `notification-service` consumes `notification-events`

Kafka folders:

- `backend/npci-service/src/main/java/com/studentbanking/npci/kafka`
- `backend/payment-service/src/main/java/com/studentbanking/payment/kafka`
- `backend/bank-service/src/main/java/com/studentbanking/bank/kafka`
- `backend/ledger-service/src/main/java/com/studentbanking/ledger/kafka`
- `backend/notification-service/src/main/java/com/studentbanking/notification/kafka`

Kafka event contracts:

- `backend/common-library/src/main/java/com/studentbanking/common/dto/PaymentWorkflowEvent.java`
- `backend/common-library/src/main/java/com/studentbanking/common/dto/LedgerEvent.java`
- `backend/common-library/src/main/java/com/studentbanking/common/dto/NotificationEvent.java`

Kafka topics are created by `kafka-init` in `backend/docker-compose.yml`.

## Docker and deployment

Main compose file:

- `C:\Users\dkoth\OneDrive\Documents\multi bank service\backend\docker-compose.yml`

It runs:

- Redis
- Zookeeper
- Kafka
- Kong
- all backend services

It does **not** run:

- frontend
- PostgreSQL / MySQL

You bring your own external database.

Use:

- `C:\Users\dkoth\OneDrive\Documents\multi bank service\backend\.env.example`

Create:

- `C:\Users\dkoth\OneDrive\Documents\multi bank service\backend\.env`

Set:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- optional service URLs if you want custom networking

## Why this is closer to real life now

This project now has several patterns that feel much more industry-like:

- separate deployable services
- persistence-backed entities instead of only mock responses
- service-to-service HTTP communication
- external database configuration
- Dockerized backend services
- orchestration-style payment flow
- rollback/compensation logic in payment flow
- Kafka-driven transaction workflow with Payment Service as the Saga coordinator

## Still needed before public production use

This is the honest part: if you want random real users on the internet to use it safely, we still need more work.

Important next upgrades:

- real JWT auth and refresh token flow
- Spring Security across all services
- API gateway auth filters
- idempotency keys for payments
- distributed tracing and structured logs
- retries / circuit breakers / timeouts
- Kafka retry topics and dead-letter topics
- Flyway or Liquibase migrations
- service-specific DB schemas
- integration tests and contract tests
- rate limiting and abuse protection
- secrets management for deployment
- CI/CD pipeline and cloud deployment manifests

## Best way to present it on resume

This is the strongest honest framing:

- Built a multi-service banking and UPI backend using Spring Boot, PostgreSQL, Redis, Kafka, Kong, and Docker
- Implemented account creation, UPI resolution, NPCI-style routing, and orchestration-based payment flow with compensation handling
- Structured the backend into independently deployable services with DTO, controller, entity, repository, and service layers

## Recommended next implementation phase

If we continue from here, the highest-value next step is:

1. add real JWT security
2. connect `auth-service` and `user-service`
3. add Kafka retry topics and dead-letter topics
4. add Flyway migrations and cloud-ready profiles
5. add integration tests for the full Kafka payment saga
