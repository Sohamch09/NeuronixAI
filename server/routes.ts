import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import { generateAIResponse } from "./gemini";

// External API services (can be extended with real API keys)
async function getWeatherData(location: string = "New York") {
  // Mock weather API response - replace with real API integration
  const weatherResponses = [
    {
      location: "New York, NY",
      temperature: "72°F",
      condition: "Sunny",
      humidity: "45%",
      wind: "8 mph",
      icon: "sun"
    },
    {
      location: "Los Angeles, CA", 
      temperature: "78°F",
      condition: "Partly Cloudy",
      humidity: "60%",
      wind: "5 mph",
      icon: "cloud-sun"
    }
  ];
  
  return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
}

async function getNewsData() {
  // Mock news API response - replace with real API integration
  return {
    headline: "Tech Industry Sees Major Innovation Breakthrough",
    summary: "Recent developments in AI and machine learning continue to reshape industries worldwide.",
    source: "Tech News Today",
    timestamp: new Date().toISOString()
  };
}

async function calculateExpression(expression: string) {
  try {
    // Basic calculator - enhance with math expression parser
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    const result = Function(`"use strict"; return (${sanitized})`)();
    return { expression, result, valid: true };
  } catch {
    return { expression, result: "Invalid expression", valid: false };
  }
}

async function translateText(text: string, targetLang: string = "es") {
  // Mock translation - replace with real translation API
  const translations: Record<string, Record<string, string>> = {
    "hello": { "es": "hola", "fr": "bonjour", "de": "hallo" },
    "how are you": { "es": "¿cómo estás?", "fr": "comment allez-vous", "de": "wie geht es dir" },
    "thank you": { "es": "gracias", "fr": "merci", "de": "danke" }
  };
  
  const lowerText = text.toLowerCase();
  const translated = translations[lowerText]?.[targetLang] || `[${text} translated to ${targetLang}]`;
  
  return { original: text, translated, targetLanguage: targetLang };
}

async function processMessageWithAI(message: string) {
  try {
    // Use Gemini AI to generate intelligent responses
    const aiResponse = await generateAIResponse(message);
    
    return {
      type: 'ai_response',
      data: {},
      response: aiResponse
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      type: 'error',
      data: {},
      response: "I'm experiencing some technical difficulties. Please try again in a moment."
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });
  
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
      });
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Process message with AI and get response
      const aiResponse = await processMessageWithAI(messageData.content);
      
      // Save AI response
      const botMessage = await storage.createMessage({
        content: aiResponse.response,
        isUser: "false",
        conversationId,
      });
      
      res.json({
        userMessage,
        botMessage,
        aiData: aiResponse.data,
        aiType: aiResponse.type
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
