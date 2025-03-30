const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const NLP_SERVICE_URL = "http://localhost:5000/nlp";
const JWT_SECRET = crypto.randomBytes(64).toString("hex");
console.log("JWT_SECRET:", JWT_SECRET);

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Rate limit middleware for the /query endpoint
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});
app.use("/query", limiter);

// Middleware to verify JWT and check role
const authenticateJWT = (roles) => {
  return (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
      logger.warn("Access Denied: No Token Provided");
      return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }
    jwt.verify(token.replace("Bearer ", ""), JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn("Invalid Token");
        return res.status(403).json({ message: "Invalid Token" });
      }
      if (!roles.includes(user.role)) {
        logger.warn("Access Denied: Insufficient Permissions");
        return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
      }
      req.user = user;
      next();
    });
  };
};

// Public route (e.g., login)
app.post("/login", (req, res) => {
  const { username, role } = req.body;
  if (!username || !role) {
    logger.error("Username and Role required");
    return res.status(400).json({ message: "Username and Role required" });
  }
  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// API Gateway route to NLP Microservice
app.post("/query", authenticateJWT(["engineer", "executive"]), async (req, res) => {
  try {
    logger.info("Forwarding query to NLP Service");
    const response = await axios.post(NLP_SERVICE_URL, req.body);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error communicating with NLP Service: ${error.message}`);
    res.status(500).json({ message: "Error communicating with NLP Service", error: error.message });
  }
});

// Custom error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => logger.info(`API Gateway running on port ${PORT}`));