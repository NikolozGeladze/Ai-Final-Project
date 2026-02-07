import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log(chalk.green("✅ MongoDB Connected")))
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

//! ---------- Schemas ----------

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  category: String,
  description: String,
  notes: String,

  amount: Number,
  month: String,
  date: String
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);

const insightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  type: { type: String, enum: ["warning", "success", "info"] },
});
const Insight = mongoose.model("Insight", insightSchema);

//! ---------- Middleware ----------

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

//! ---------- Auth Routes ----------

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(chalk.bold.red("Error during signup:", err));
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const expiresIn = rememberMe ? "30d" : "1d";

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      message: "Login successful", 
      rememberMe, 
      user: { _id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//! ---------- Expense Routes ----------

app.post("/api/expenses", async (req, res) => {
  try {
    const { userId, amount, category, date, description } = req.body;

    if (!userId || !amount || !category || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newExpense = new Expense({
      userId,
      amount,
      category,
      date,
      description,
      notes: req.body.notes || ''
    });

    const savedExpense = await newExpense.save();

    // 🔑 Return the saved expense
    res.status(201).json({ message: "Expense added successfully", expense: savedExpense });
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//! ---------- Edit Expense Route ----------

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, description, notes } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { amount, category, date, description, notes },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense updated successfully", expense: updatedExpense });
  } catch (err) {
    console.error("Error editing expense:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/expenses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const expenses = await Expense.find({ userId });

    res.status(200).json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/ai/insights", authMiddleware, async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !expenses.length) {
      return res.status(400).json({ message: "No expenses provided" });
    }

    const expensesSummary = expenses
      .map(e => `Category: ${e.category}, Amount: ${e.amount}`)
      .join("\n");

    const prompt = `
            You are a personal finance AI.

            Analyze the expenses and return EXACTLY 3 insights as JSON array.
            Each insight must have:
            - text
            - type ("warning" | "success" | "info")
              
            Example format:
            [
              { "text": "...", "type": "warning" }
            ]

Expenses:
${expensesSummary}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = response.data.choices[0].message.content;
    const insights = JSON.parse(aiText);

    await Insight.insertMany(
      insights.map(i => ({ ...i, userId: req.user.id }))
    );

    res.json({ insights });

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({ message: "AI generation failed" });
  }
});

app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


//! ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(chalk.bold.blue(`Server is running on http://localhost:${PORT}`));
});