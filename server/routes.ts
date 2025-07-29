import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

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
  const lowerMessage = message.toLowerCase();
  
  // Weather queries
  if (lowerMessage.includes('weather')) {
    const weatherData = await getWeatherData();
    return {
      type: 'weather',
      data: weatherData,
      response: `Here's the current weather in ${weatherData.location}:`
    };
  }
  
  // News queries
  if (lowerMessage.includes('news')) {
    const newsData = await getNewsData();
    return {
      type: 'news',
      data: newsData,
      response: `Here's the latest news:`
    };
  }
  
  // Calculator queries
  if (lowerMessage.includes('calculate') || /[\d+\-*/]/.test(message)) {
    const mathExpression = message.replace(/calculate|what is|=|\?/gi, '').trim();
    const calculation = await calculateExpression(mathExpression);
    return {
      type: 'calculation',
      data: calculation,
      response: calculation.valid ? 
        `The result of ${calculation.expression} is ${calculation.result}` :
        "I couldn't calculate that expression. Please check the format."
    };
  }
  
  // Translation queries
  if (lowerMessage.includes('translate')) {
    const textMatch = message.match(/"([^"]+)"/);
    const langMatch = message.match(/to (\w+)/i);
    
    if (textMatch) {
      const translation = await translateText(textMatch[1], langMatch?.[1] || 'es');
      return {
        type: 'translation',
        data: translation,
        response: `Translation: "${translation.translated}"`
      };
    }
  }
  
  // Time queries
  if (lowerMessage.includes('time')) {
    const currentTime = new Date().toLocaleTimeString();
    return {
      type: 'time',
      data: { time: currentTime },
      response: `The current time is ${currentTime}.`
    };
  }
  
  // Default responses
  const defaultResponses = [
    "I understand your question. How can I help you further?",
    "That's interesting! What would you like to know more about?",
    "I'm here to assist you. Feel free to ask me about weather, news, calculations, or translations.",
    "Thank you for your message. Is there anything specific I can help you with?",
  ];
  
  return {
    type: 'general',
    data: {},
    response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  };
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
