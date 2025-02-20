import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

// pool-ul de conexiuni la PostgreSQL
const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

export default {
  query: (text, params) => pool.query(text, params),
};
