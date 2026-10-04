# ShopStream – Event-Driven E-Commerce Microservices Platform

ShopStream is a full-stack, event-driven e-commerce microservices platform built to demonstrate modern distributed-system technologies including **Apache Kafka, gRPC, Protocol Buffers, GraphQL, TypeScript, Docker, PostgreSQL, and React**.

The platform provides order management, real-time inventory validation, event-driven notifications, and a monitoring dashboard.

---

## 🚀 Project Overview

ShopStream follows a microservices architecture where each service is responsible for a specific business capability.

A customer creates an order through the React dashboard. The request is sent through GraphQL to the Order Service. The Order Service communicates synchronously with the Inventory Service using gRPC and Protocol Buffers to validate and reserve stock.

After a successful order:

1. The order is stored in PostgreSQL.
2. An `OrderCreated` event is published to Apache Kafka.
3. The Notification Service consumes the event asynchronously.
4. The dashboard displays orders and live inventory information.

---

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │    React Dashboard   │
                         │      Port 5173       │
                         └──────────┬───────────┘
                                    │
                                    │ GraphQL
                                    ▼
                         ┌──────────────────────┐
                         │     GraphQL API      │
                         │      Port 4000       │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌──────────────────────┐
                         │    Order Service     │
                         │      Port 3001       │
                         │   Node.js + TS       │
                         └───────┬───────┬──────┘
                                 │       │
                         gRPC + Proto     │ Kafka
                                 │       │
                                 ▼       ▼
                    ┌─────────────────┐  ┌─────────────────┐
                    │    Inventory    │  │ Apache Kafka    │
                    │     Service    │  │   Port 9092     │
                    │    Port 50051   │  └────────┬────────┘
                    └─────────────────┘           │
                                                  │
                                                  ▼
                                      ┌────────────────────┐
                                      │ Notification       │
                                      │ Service            │
                                      └────────────────────┘

                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │      Port 5432       │
                         └──────────────────────┘
```

---

## ✨ Key Features

- Event-driven microservices architecture
- GraphQL API for client communication
- gRPC communication between microservices
- Protocol Buffers for strongly structured service contracts
- Apache Kafka event streaming
- Real-time inventory validation
- Inventory stock decrement after successful orders
- PostgreSQL order persistence
- Kafka-based notification processing
- Dockerized services
- Docker Compose orchestration
- React-based monitoring dashboard
- Order search and monitoring
- Inventory monitoring
- Service health overview
- Professional dark-themed dashboard

---

## 🧩 Services

| Service | Technology | Port | Responsibility |
|---|---|---:|---|
| Dashboard | React + Vite | 5173 | User interface and monitoring |
| GraphQL API | Node.js + GraphQL | 4000 | Client-facing API layer |
| Order Service | Node.js + TypeScript | 3001 | Order validation and persistence |
| Inventory Service | gRPC + Protocol Buffers | 50051 | Stock validation and management |
| Kafka | Apache Kafka | 9092 | Event streaming |
| Notification Service | Node.js + KafkaJS | Internal | Consumes order events |
| PostgreSQL | PostgreSQL 16 | 5432 | Order database |

---

## 🔄 Order Processing Flow

```text
1. User creates an order
           ↓
2. React Dashboard
           ↓
3. GraphQL API
           ↓
4. Order Service
           ↓
5. gRPC → Inventory Service
           ↓
6. Stock validated and reserved
           ↓
7. Order stored in PostgreSQL
           ↓
8. OrderCreated event published
           ↓
9. Apache Kafka
           ↓
10. Notification Service consumes event
```

---

## 📡 Communication Technologies

### GraphQL

GraphQL acts as the client-facing API layer between the React dashboard and backend services.

Example query:

```graphql
{
  inventory {
    productId
    category
    stock
    status
  }
}
```

---

### gRPC + Protocol Buffers

The Order Service communicates with the Inventory Service using gRPC.

The service contract is defined using Protocol Buffers:

```proto
service InventoryService {

  rpc CheckStock (StockRequest)
    returns (StockResponse);

  rpc GetInventory (EmptyRequest)
    returns (InventoryResponse);
}
```

This provides structured and efficient service-to-service communication.

---

### Apache Kafka

Kafka is used for asynchronous event-driven communication.

After an order is created, the Order Service publishes:

```text
OrderCreated
```

to the:

```text
orders
```

Kafka topic.

The Notification Service consumes this event independently.

---

## 🗄️ Database

ShopStream uses PostgreSQL for persistent order storage.

### Orders Table

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐳 Docker

Every major backend component is containerized.

Docker Compose is used to run the complete platform:

```bash
docker compose up --build
```

Services can also be started individually:

```bash
docker compose up --build graphql-api
```

```bash
docker compose up --build dashboard
```

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React

### Backend
- Node.js
- TypeScript
- Express
- GraphQL

### Communication
- gRPC
- Protocol Buffers
- GraphQL

### Event Streaming
- Apache Kafka
- KafkaJS

### Database
- PostgreSQL

### Infrastructure
- Docker
- Docker Compose

### Development Tools
- Git
- GitHub
- VS Code

---

## 📁 Project Structure

```text
shopstream/
│
├── dashboard/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── graphql-api/
│   ├── src/
│   │   ├── server.js
│   │   ├── inventory-client.js
│   │   └── proto/
│   │       └── inventory.proto
│   ├── Dockerfile
│   └── package.json
│
├── order-service/
│   ├── src/
│   │   ├── server.ts
│   │   ├── inventory-client.ts
│   │   ├── kafka/
│   │   └── db/
│   ├── Dockerfile
│   └── package.json
│
├── inventory-service/
│   ├── src/
│   │   └── server.ts
│   ├── proto/
│   │   └── inventory.proto
│   ├── Dockerfile
│   └── package.json
│
├── notification-service/
│   ├── src/
│   │   └── consumer.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ▶️ Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Docker Desktop
- Git

### Clone the repository

```bash
git clone <https://github.com/Vyshu222005/shopstream>
cd shopstream
```

### Start the platform

```bash
docker compose up --build
```

### Access the applications

Dashboard:

```text
http://localhost:5173
```

GraphQL API:

```text
http://localhost:4000/graphql
```

Order Service:

```text
http://localhost:3001
```

---

## 🧪 Example GraphQL Query

### Get Inventory

```graphql
{
  inventory {
    productId
    category
    stock
    status
  }
}
```

### Get Orders

```graphql
{
  orders {
    id
    productId
    quantity
    status
  }
}
```

### Create Order

```graphql
mutation {
  createOrder(
    productId: "MOUSE-001"
    quantity: 2
  ) {
    id
    productId
    quantity
    status
  }
}
```

---

## 🔐 Validation

The Order Service validates:

- Product ID
- Positive integer quantity
- Product availability
- Available inventory before creating an order

If sufficient stock is available, the Inventory Service reserves the requested quantity.

If stock is insufficient, the order is rejected.

---

## 📊 Dashboard

The React dashboard provides:

- Order statistics
- Recent orders
- Order creation
- Inventory status
- Kafka activity
- Notification events
- Microservice health
- Technology architecture overview

---


## 🔮 Future Improvements

Possible future enhancements include:

- Persistent inventory storage
- Kafka retry and dead-letter queues
- Authentication and authorization
- API Gateway enhancements
- Kubernetes deployment
- Distributed tracing
- Prometheus/Grafana monitoring
- Automated CI/CD pipeline
- Automated integration tests

---

## 👩‍💻 Author

**Vyshnavi Polavarapu**

B.Tech – Computer Science & Engineering  
Artificial Intelligence & Machine Learning

---

## 📌 Project Status

**Completed and tested**

ShopStream demonstrates an event-driven microservices architecture using GraphQL, gRPC, Protocol Buffers, Apache Kafka, Docker, PostgreSQL, TypeScript, and React.
```