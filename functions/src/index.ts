import * as functions from 'firebase-functions';
import express from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Middleware to verify Firebase ID Token
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const app = express();
app.use(express.json());

// API routes
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.post("/api/process-trade", authenticate, async (req: express.Request, res: express.Response) => {
  const { userId, contractId, profit } = req.body;
  if (!userId || !contractId || profit === undefined) return res.status(400).json({ error: "Missing required fields" });
  
  // Ensure the authenticated user matches the userId provided in the request
  if ((req as any).user.uid !== userId) return res.status(403).json({ error: "Forbidden" });

  try {
    // 1. Check if trade already processed (idempotency)
    const tradeRef = db.collection("processed_trades").doc(contractId);
    const tradeDoc = await tradeRef.get();
    if (tradeDoc.exists) return res.status(400).json({ error: "Trade already processed" });

    // 2. Find referrer
    const userDoc = await db.collection("users").doc(userId).get();
    const referralCode = userDoc.data()?.referralCode;
    
    if (referralCode) {
      const referrerRef = db.collection("referrals").doc(referralCode);
      const referrerDoc = await referrerRef.get();
      const currentBalance = referrerDoc.data()?.balance || 0;
      
      // 3. Calculate 1% earnings
      const earnings = profit * 0.01;
      
      // 4. Update referrer balance
      await referrerRef.set({ balance: currentBalance + earnings, updatedAt: new Date().toISOString() }, { merge: true });
    }

    // 5. Mark trade as processed
    await tradeRef.set({ userId, profit, processedAt: new Date().toISOString() });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to process trade", error);
    res.status(500).json({ success: false, error: "Failed to process trade" });
  }
});

app.get("/api/referral-balance/:userId", async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId as string;
  try {
    const doc = await db.collection("referrals").doc(userId).get();
    if (!doc.exists) {
      res.json({ balance: 0 });
    } else {
      res.json(doc.data());
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch balance" });
  }
});

  const handleCreateWithdrawal = async (req: express.Request, res: express.Response) => {
    const withdrawal = req.body;
    withdrawal.timestamp = Date.now();
    withdrawal.status = withdrawal.status || 'pending';
    
    try {
      const docRef = await db.collection("withdrawals").add(withdrawal);
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save withdrawal" });
    }
  };

  app.post("/api/w-requests", handleCreateWithdrawal);
  app.post("/api/withdrawals", handleCreateWithdrawal);

  const handleUpdateWithdrawal = async (req: express.Request, res: express.Response) => {
    const id = req.params.id as string;
    const { status, rejectionReason } = req.body;
    
    try {
      await db.collection("withdrawals").doc(id).update({ status, rejectionReason });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update withdrawal" });
    }
  };

  app.patch("/api/w-requests/:id", handleUpdateWithdrawal);
  app.patch("/api/withdrawals/:id", handleUpdateWithdrawal);

  const handleGetWithdrawals = async (req: express.Request, res: express.Response) => {
    try {
      const snapshot = await db.collection("withdrawals").orderBy("timestamp", "desc").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch withdrawals" });
    }
  };

  app.get("/api/w-requests", handleGetWithdrawals);
  app.get("/api/withdrawals", handleGetWithdrawals);

// Export the app as a Firebase Function
export const api = functions.https.onRequest(app);
