require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Create the Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Handle incoming Telegram messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text?.trim();

  if (!userMessage) return;

  if (userMessage.toLowerCase() === '/start') {
    const welcomeMessage = `Hey I’m Shanaya! 💫\n\nTere liye ek mast motivation line layi hu — sun:\n\n✨ "Your dreams are big, so your efforts need to be even bigger — but you will make it because you're not someone who gives up."`;
    bot.sendMessage(chatId, welcomeMessage);
    return;
  }

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    bot.sendMessage(chatId, reply || '🤖 Gemini did not return a response.');
  } catch (error) {
    console.error('Gemini Error:', error?.response?.data || error.message);
    bot.sendMessage(chatId, '⚠️ Error talking to Gemini.');
  }
});

// Simple health check route
app.get('/', (req, res) => {
  res.send('🤖 Shanaya Bot is running!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
