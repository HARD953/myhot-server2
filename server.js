import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";
import { rateLimit } from "express-rate-limit";
import { sequelize } from "./sequelize.js";
import { IndexRouter } from "./controllers/v0/index.router.js";

import { fileURLToPath } from "url";

import swaggerDocument from "./swagger.json" assert { type: "json" };
import { defineAssociations } from "./controllers/v0/associationModel.js";
import { initializeDatabase } from "./scripts/init.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageDirectory = path.join(__dirname, "uploads", "images");

const app = express();

// Configuration de la connexion à la base de données
(async () => {
  try {
    // await sequelize.sync({ alter: true });
    initializeDatabase();

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Middleware de session
app.use(
  session({
    genid: (req) => {
      return uuidv4();
    },
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 3600000,
      httpOnly: true,
    },
  })
);

// Définir la route pour servir les images
app.use("/uploads/images/", express.static(imageDirectory));

// Middleware de journalisation
app.use(logger("dev"));

// Middleware de gestion des cookies
app.use(cookieParser());

// Middleware de gestion des CORS
const corsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
    "Authorization",
  ],
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  origin: [
    "https://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "https://myhot-myhot.vercel.app",
    "http://myhot-myhot.vercel.app",
    "https://myhotdashboard.lanfiasave.com",
    "http://myhotdashboard.lanfiasave.com"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: true,
};
app.use(cors(corsOptions));

// Middleware de limite de taux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Trop de tentatives. Veuillez réessayer dans 15 minutes.",
  limit: 10000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);

// Middleware de parsing des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware pour la documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Router principal
app.use("/api/v0", IndexRouter);

// Route de test POST
app.post("/api/v0/test-post", (req, res) => {
  console.log("response :", req.body);
  res.status(200).send({ message: "test endpoint" });
});

export default app;
