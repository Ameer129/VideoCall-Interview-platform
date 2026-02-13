import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();
const __dirname = path.resolve();

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.json());

// 🔥 DEV-SAFE CORS (for Clerk development mode + Render)
app.use(
  cors({
    origin: true,      // reflect request origin
    credentials: true, // allow cookies
  })
);

// --------------------
// ROUTES
// --------------------
app.use("/api/inngest", serve({ client: inngest, functions }));

// Clerk protected routes
app.use("/api/chat", clerkMiddleware(), chatRoutes);
app.use("/api/sessions", clerkMiddleware(), sessionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// --------------------
// PRODUCTION STATIC SERVE
// --------------------
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}


// --------------------
// START SERVER
// --------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("🚀 Server is running on port:", ENV.PORT)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
