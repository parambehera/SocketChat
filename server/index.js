import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import configurePassport from "./auth/passportConfig.js";

dotenv.config();

const app = express();
const server = createServer(app);

// MongoDB
mongoose.connect(process.env.ATLAS_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// 🔐 Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password: hashed });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // info.message comes from your strategy (e.g., "Wrong password")
      return res.status(401).json({ error: info.message });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ user });
    });
  })(req, res, next);
});

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// 💬 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = new Map(); // phone => socket.id

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("register-phone", (phone) => {
    userSocketMap.set(phone, socket.id);
    console.log(`📱 Mapped phone ${phone} to socket ${socket.id}`);
  });

  socket.on("private-message", ({ to, msg, from }) => {
    const toSocketId = userSocketMap.get(to);
    if (toSocketId) {
      const payload = {
        from,
        msg,
        timestamp: new Date().toLocaleTimeString(),
      };
      io.to(toSocketId).emit("receive-message", payload);
      io.to(socket.id).emit("receive-message", payload); // Optional: echo to sender
      console.log(`💬 Message from ${from} to ${to}: ${msg}`);
    }
  });

  socket.on("disconnect", () => {
    for (const [phone, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(phone);
        console.log(`❌ Disconnected: Removed phone ${phone}`);
        break;
      }
    }
    console.log("🔌 User disconnected:", socket.id);
  });
});

// Start server
server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
