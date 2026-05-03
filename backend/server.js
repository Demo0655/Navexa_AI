const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// OTP Storage (In-memory for MVP)
const otps = new Map();

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'demo40701@gmail.com',
    pass: 'uiqq mivq sxha ckjw' // User needs to provide an app password
  }
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

app.use(cors());
app.use(express.json());

// Helper: Detect Mode
function detectMode(message) {
  const msg = message.toLowerCase();
  if (msg.includes("code") || msg.includes("build") || msg.includes("fix") || msg.includes("html") || msg.includes("css") || msg.includes("js") || msg.includes("function")) {
    return "coding";
  }
  if (msg.includes("explain") || msg.includes("compare") || msg.includes("analysis") || msg.includes("research") || msg.includes("history")) {
    return "research";
  }
  return "chat";
}

// Helper: Build Prompt based on mode
function buildPrompt(message, mode) {
  if (mode === "coding") {
    return `You are Navexa AI (Coding Expert).
Always respond in this EXACT format:

🔹 Language: [Language Name]
📌 Description: [Short explanation]
💻 Code:
\`\`\`[Language]
[Code here]
\`\`\`
⚙️ How to Use: [Step-by-step instructions]

User Input: ${message}`;
  }

  if (mode === "research") {
    return `You are Navexa AI (Research Expert).
Always respond in this EXACT format:

📌 Topic Overview: [Overview]
📊 Key Points: [Bullet points]
📈 Analysis: [Detailed analysis]
✅ Conclusion: [Final summary]

User Input: ${message}`;
  }

  return `You are Navexa AI. Give clean, helpful, and formatted answers using markdown.
User Input: ${message}`;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const mode = detectMode(message);
    const prompt = buildPrompt(message, mode);

    // Prepare messages for Gemini REST API
    const contents = (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || " " }]
    }));
    
    // Add the current prompt
    contents.push({
        role: 'user',
        parts: [{ text: prompt }]
    });

    // Use native fetch to bypass SDK versioning issues completely
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error Response:", errText);
      throw new Error(`Gemini Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response structure
    let text = "I'm sorry, I couldn't generate a response.";
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts[0].text;
    }

    res.json({
      mode,
      response: text
    });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Failed to generate response: " + error.message });
  }
});

// Endpoint: Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  otps.set(email, { otp, expires: Date.now() + 600000 }); // 10 mins expiry

  try {
    await transporter.sendMail({
      from: 'Navexa AI <demo40701@gmail.com>',
      to: email,
      subject: 'Your Navexa AI OTP Code',
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    });
    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = otps.get(email);

  if (stored && stored.otp === otp && stored.expires > Date.now()) {
    otps.delete(email); // One-time use
    res.json({ success: true, message: "OTP verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
});


// Cloudinary Delete Image Endpoint
app.post('/api/delete-image', async (req, res) => {
  const { public_id } = req.body;
  
  // We use the cloud name from the frontend's upload URL, or env.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dszifueob';
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({ error: 'Cloudinary API credentials missing. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your backend .env file.' });
  }

  try {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    
    // Generate SHA-1 Signature: sha1("public_id=xxx&timestamp=xxx" + apiSecret)
    const str = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    // Use native fetch to call Cloudinary Destroy API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_id,
        timestamp,
        api_key: apiKey,
        signature
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Navexa Backend running at http://localhost:${port}`);
  });
}
