import express from "express";
import pool from "./db/database";
import { producer } from "./kafka/kafka";
import { checkStock } from "./inventory-client";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "ShopStream Order Service",
    status: "running",
  });
});

app.post("/orders", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product ID
    if (
      typeof productId !== "string" ||
      productId.trim().length === 0
    ) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    // Validate quantity
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "quantity must be a positive integer",
      });
    }

    // Check stock using gRPC
    const stockResult = await checkStock(productId, quantity);

    if (!stockResult.available) {
      return res.status(400).json({
        message: stockResult.message,
        remainingStock: stockResult.remaining_stock,
      });
    }

    // Save order in PostgreSQL
    const result = await pool.query(
      `INSERT INTO orders (product_id, quantity, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [productId.trim(), quantity, "CREATED"]
    );

    const order = result.rows[0];

    // Publish event to Kafka
    await producer.send({
      topic: "orders",
      messages: [
        {
          key: String(order.id),
          value: JSON.stringify({
            event: "OrderCreated",
            order: order,
          }),
        },
      ],
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

producer
  .connect()
  .then(() => {
    console.log("Kafka connected successfully!");
  })
  .catch((error) => {
    console.error("Kafka connection failed:", error);
  });

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});