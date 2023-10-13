# Deepkit Broker

Deepkit Broker is a high-performance abstraction for message queues, pub/sub, key/value store, cache, atomic operations, and more. All in the spirit of type-safety with automatic serialization and validation, high-performance, and scalability. 

Various adapters are available to use it with different backends:

- Deepkit Broker Server
- Redis
- Filesystem
- Database
- Memory
- RabbitMQ
- Kafka

## Installation

Deepkit Broker is installed and activated per default when [Deepkit Framework](./framework.md) is used. Otherwise, you can install it via:

```bash
npm install @deepkit/broker
```

## Usage

```typescript
