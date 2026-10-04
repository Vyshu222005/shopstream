import { Pool } from "pg";

const pool = new Pool({
  user: "shopstream",
  host: "postgres",
  database: "shopstream",
  password: "shopstream123",
  port: 5432,
});

export default pool;

pool.query("SELECT NOW()")
  .then(() => {
    console.log("PostgreSQL connected successfully!");
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error);
  });
