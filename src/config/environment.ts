import dotenv from "dotenv";
dotenv.config({
  path: "./src/config/config.env",
});

export const port = process.env.PORT;
export const url = process.env.DB_URL;
export const host = process.env.DB_HOST;
export const db_port = process.env.DB_PORT;
export const db_password = process.env.DB_PASSWORD;
export const jwtSecret = process.env.JWT_SECRET || "myverysecretjwt";
