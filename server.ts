import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import archiver from "archiver";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate app icon if it doesn't exist
async function ensureAppIcon() {
  const iconPath = path.join(__dirname, "public", "app-icon.png");
  if (fs.existsSync(iconPath)) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: "A professional, modern app icon for a trading application named 'Tele Trader'. The icon should feature a sleek, stylized 'T' integrated with a rising candlestick chart. Color palette: Deep Navy Blue, Emerald Green, and crisp White. Minimalist, high-tech, premium feel. 1024x1024 resolution." }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content) return;

    const parts = candidates[0].content.parts;
    if (!parts) return;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        const publicDir = path.join(__dirname, "public");
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir);
        }
        fs.writeFileSync(iconPath, buffer);
        console.log("App icon generated successfully");
      }
    }
  } catch (error) {
    console.error("Failed to generate app icon:", error);
  }
}

// Initialize Firebase Admin
let db: admin.firestore.Firestore | undefined;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    db = admin.firestore();
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("Firebase Admin environment variables missing. Firestore features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = "https://tele-traderz.web.app/";

let bot: TelegramBot | null = null;

async function initTelegramBot() {
  if (TELEGRAM_BOT_TOKEN) {
    try {
      bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
      
      bot.on('polling_error', (error: any) => {
        console.error("Telegram polling error:", error.message || error);
      });

      await bot.deleteWebHook();
      await bot.startPolling();
      
      bot.onText(/\/start/, (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        const welcomeText = `🚀 Welcome to Tele Trader!

The fastest way to trade Synthetic Indices and Forex directly from Telegram.

💰 Earn 1% commission on every trade.
📈 Real-time charts and instant execution.
🔒 Secure and reliable.

Click the button below to start trading!`;

        bot?.sendMessage(chatId, welcomeText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Open Web App",
                  web_app: { url: APP_URL }
                }
              ]
            ]
          }
        });
      });

      // Schedule automated messages
      cron.schedule('0 10 * * *', async () => {
        if (!db) return;
        const usersSnapshot = await db.collection("telegram_users").get();
        const messages = [
          {
            text: "Deposit Now to Trade on Real account 📥\n\nDeposit minimum balance 💰 from cashier and trade with different accests like Forex💰, Commodities💰, and Synthesis 📶.",
            buttonText: "💰 Open Cashier",
            url: `${APP_URL}/cashier`
          },
          {
            text: "Try Demo Account 👍\n\nTry different strategies from demo account and implement it on the real account. Try Safe Trading with Tele Trader Now.✅",
            buttonText: "🚀 Open Web App",
            url: APP_URL
          },
          {
            text: "Refer and Earn 💸\n\nRefer Your friends from your referral link and earn 1% commission on every trade they make whether it may be win 🏆or lose 😠.",
            buttonText: "🔗 Refer and Earn",
            url: `${APP_URL}/refer`
          }
        ];

        for (const doc of usersSnapshot.docs) {
          const userData = doc.data();
          if (userData.telegramId && Math.random() < 0.3) { // 30% chance to send per day
            const msg = messages[Math.floor(Math.random() * messages.length)];
            try {
              await bot?.sendMessage(userData.telegramId, msg.text, {
                reply_markup: {
                  inline_keyboard: [[{ text: msg.buttonText, web_app: { url: msg.url } }]]
                }
              });
            } catch (e) {
              console.error(`Failed to send automated message to ${userData.telegramId}:`, e);
            }
          }
        }
      });

      console.log("Telegram Bot listener initialized");
    } catch (e: any) {
      console.error("Telegram bot initialization error:", e);
    }
  }
}

initTelegramBot();

async function sendTelegramMessage(chatId: string, text: string) {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, text);
  } catch (e) {
    console.error("Telegram send error:", e);
  }
}

async function startServer() {
  await ensureAppIcon();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/download-source", (req: express.Request, res: express.Response) => {
    res.attachment("tele-traderz-source.zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    archive.on("error", (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Append files from the root directory, ignoring node_modules, dist, and .git
    archive.glob("**/*", {
      cwd: __dirname,
      ignore: ["node_modules/**", "dist/**", ".git/**", "firebase-debug.log"],
      dot: true
    });

    archive.finalize();
  });

  app.get("/api/health", (req: express.Request, res: express.Response) => {
    res.json({ status: "ok" });
  });

  app.post("/api/withdrawals", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    
    const withdrawal = req.body;
    withdrawal.timestamp = new Date().toISOString();
    withdrawal.status = 'pending';
    
    try {
      const userRef = db.collection("balances").doc(withdrawal.userId);
      const withdrawalRef = db.collection("withdrawals").doc();

      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        const currentBalance = userDoc.exists ? (userDoc.data()?.balance || 0) : 0;

        if (currentBalance < withdrawal.amount) {
          throw new Error("Insufficient balance");
        }

        // Deduct balance
        t.set(userRef, {
          balance: admin.firestore.FieldValue.increment(-withdrawal.amount)
        }, { merge: true });

        // Save withdrawal request
        t.set(withdrawalRef, withdrawal);
      });

      res.json({ success: true, id: withdrawalRef.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to save withdrawal" });
    }
  });

  app.get("/api/withdrawals", async (req: express.Request, res: express.Response) => {
    if (!db) return res.json([]); // Return empty array if Firestore is not initialized
    
    try {
      const snapshot = await db.collection("withdrawals").orderBy("timestamp", "desc").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
      res.json([]); // Return empty array on error
    }
  });

  app.patch("/api/withdrawals/:id", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    try {
      const withdrawalRef = db.collection("withdrawals").doc(id as string);

      await db.runTransaction(async (t) => {
        const doc = await t.get(withdrawalRef);
        if (!doc.exists) throw new Error("Withdrawal not found");

        const data = doc.data();
        if (data?.status !== 'pending') throw new Error("Withdrawal already processed");

        t.update(withdrawalRef, { status, rejectionReason: rejectionReason || null });

        // Refund balance if rejected
        if (status === 'rejected') {
          const userRef = db.collection("balances").doc(data?.userId);
          t.set(userRef, {
            balance: admin.firestore.FieldValue.increment(data?.amount)
          }, { merge: true });
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to update withdrawal" });
    }
  });

  app.get("/api/referral-balance/:userId", async (req: express.Request, res: express.Response) => {
    if (!db) return res.json({ balance: 0 }); // Return 0 if Firestore is not initialized
    
    const { userId } = req.params;
    try {
      const doc = await db.collection("balances").doc(userId as string).get();
      if (doc.exists) {
        res.json(doc.data());
      } else {
        res.json({ balance: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      res.json({ balance: 0 });
    }
  });

  app.post("/api/user-telegram", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    
    const { userId, telegramId, telegramUsername } = req.body;
    if (!telegramId) return res.status(400).json({ error: "Missing Telegram ID" });

    try {
      const userRef = db.collection("telegram_users").doc(telegramId.toString());
      const doc = await userRef.get();
      const isNewUser = !doc.exists;

      const updateData: any = {
        telegramId: telegramId.toString(),
        telegramUsername: telegramUsername || null,
        lastActive: admin.firestore.FieldValue.serverTimestamp()
      };

      if (userId) {
        updateData.derivUserId = userId.toString();
      }

      await userRef.set(updateData, { merge: true });

      // Send Welcome Message instantly if they are new
      if (isNewUser) {
        await sendTelegramMessage(
          telegramId.toString(), 
          "Welcome to Tele Trader! 🚀 Connect your Deriv account to start earning 1% commission on all your trades."
        );
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to link Telegram ID" });
    }
  });

  app.post("/api/send-welcome-message", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing User ID" });

    try {
      const usersSnapshot = await db.collection("telegram_users").where("derivUserId", "==", userId.toString()).get();
      
      if (usersSnapshot.empty) {
        return res.status(404).json({ error: "Telegram user not found" });
      }

      const userData = usersSnapshot.docs[0].data();
      const telegramId = userData.telegramId;

      const messages = [
        {
          text: "Deposit Now to Trade on Real account 📥\n\nDeposit minimum balance 💰 from cashier and trade with different accests like Forex💰, Commodities💰, and Synthesis 📶.",
          buttonText: "💰 Open Cashier",
          url: `${APP_URL}/cashier`
        },
        {
          text: "Try Demo Account 👍\n\nTry different strategies from demo account and implement it on the real account. Try Safe Trading with Tele Trader Now.✅",
          buttonText: "🚀 Open Web App",
          url: APP_URL
        },
        {
          text: "Refer and Earn 💸\n\nRefer Your friends from your referral link and earn 1% commission on every trade they make whether it may be win 🏆or lose 😠.",
          buttonText: "🔗 Refer and Earn",
          url: `${APP_URL}/refer`
        }
      ];
      
      const msg = messages[Math.floor(Math.random() * messages.length)];

      await bot?.sendMessage(telegramId, msg.text, {
        reply_markup: {
          inline_keyboard: [[{ text: msg.buttonText, web_app: { url: msg.url } }]]
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trades", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    
    const { userId, contractId, buyPrice, appId } = req.body;
    if (!userId || !contractId || !buyPrice) return res.status(400).json({ error: "Missing data" });

    // Only reward trades made through our app
    const OUR_APP_ID = process.env.VITE_DERIV_APP_ID || '111810';
    if (appId && appId.toString() !== OUR_APP_ID.toString()) {
      return res.json({ success: false, reason: "External trade ignored" });
    }

    try {
      const tradeRef = db.collection("balances").doc(userId).collection("trades").doc(contractId.toString());
      const userRef = db.collection("balances").doc(userId);

      await db.runTransaction(async (t) => {
        const tradeDoc = await t.get(tradeRef);
        if (tradeDoc.exists) {
          throw new Error("Duplicate trade");
        }

        const commission = Number(buyPrice) * 0.01;
        
        // Save the trade receipt
        t.set(tradeRef, {
          buyPrice: Number(buyPrice),
          commission,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Increment the user's balance
        t.set(userRef, {
          balance: admin.firestore.FieldValue.increment(commission),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to record trade" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get(/(.*)/, (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Daily Engagement System (Runs every day at 10 AM)
  cron.schedule('0 10 * * *', async () => {
    if (!db || !bot) return;
    try {
      const usersSnapshot = await db.collection("telegram_users").get();
      const messages = [
        "💡 Tip: Real accounts earn 1% commission on every closed trade! Have you connected yours yet?",
        "🚀 Market conditions are looking great today! Open the app to check the latest trends.",
        "💰 Did you know? You can withdraw your referral commissions instantly. Keep trading!",
        "📈 Better trade conditions are available for active users. Don't miss out!",
        "🔥 Volatility indices are moving! Check your favorite symbols now."
      ];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.telegramId) {
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          sendTelegramMessage(userData.telegramId, randomMsg);
        }
      });
      console.log(`Daily engagement messages sent to ${usersSnapshot.size} users`);
    } catch (e) {
      console.error("Daily engagement system error:", e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
