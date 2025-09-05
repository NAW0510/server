// server.js
import { generateText } from 'ai';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import express from "express";
import dotenv from "dotenv";


dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(express.json());

// POST /api/generate
let chatHistory = {}; // This should ideally be managed per user/session
app.get("/api/test", async (req, res) => {
  res.json({ message: "Test endpoint is working!" });
});
app.get("/api/init", async (req, res) => {
  const { uid } = req.query;
  res.json(chatHistory[uid] || []);
});
app.post("/api/generate", async (req, res) => {
    console.log("Received request body:", req.body);
  const { prompt, uid } = req.body;
  if (!chatHistory[uid]) chatHistory[uid]=[{role: "system", content:  "You are a nutritionist that help people to find a delicious and healthy recipe."}]
  if (!prompt) {
    return res.status(400).json({ error: "Missing 'prompt' in request body" });
  }
      console.log(apiKey);
  const openrouter = createOpenRouter({
    apiKey: apiKey, // Add your API key here
  });
  const userMessage = { role: "user", content:  prompt };
  chatHistory[uid].push(userMessage);
  const { text } = await generateText({
    model: openrouter("google/gemini-2.5-flash-lite"),
    messages: chatHistory[uid],
  });
  chatHistory[uid].push({ role: "assistant", content: text });

  res.json({
    success: true,
    prompt,
    result: chatHistory[uid],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:3000/api/generate`);
});