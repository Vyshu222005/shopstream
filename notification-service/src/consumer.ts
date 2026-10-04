import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "shopstream-notification-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({
  groupId: "notification-service-group",
});

async function startConsumer() {
  await consumer.connect();

  console.log("Notification Service connected to Kafka");

  await consumer.subscribe({
    topic: "orders",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString());

      console.log("📩 Order event received:");
      console.log(JSON.stringify(event, null, 2));

      if (event.event === "OrderCreated") {
        console.log(
          `🔔 Notification: Order ${event.order.id} created for ${event.order.product_id}`
        );
      }
    },
  });
}

startConsumer().catch((error) => {
  console.error("Notification Service failed:", error);
});