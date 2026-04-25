require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large image uploads

// --- Firebase Admin Configuration ---
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized via Service Account Key.');
    } else {
        // Fallback for GCP Cloud Run / default env
        admin.initializeApp();
        console.log('⚠️ Firebase Admin initialized with default credentials.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

// --- Gemini Configuration (from .env) ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// --- Staff email whitelist ---
const STAFF_EMAILS = (process.env.STAFF_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

app.get('/api/staff', (req, res) => {
    res.json({ staffEmails: STAFF_EMAILS });
});

async function analyzeCrisisAI(data) {
    try {
        const prompt = `Act as an emergency AI dispatcher. Analyze the input. 
        Return ONLY JSON: {"cat": "Medical/Fire/Security/Earthquake", "sev": "CRITICAL/STABLE", "act": "One instruction", "trans": "English translation"}`;
        
        const parts = [{ text: prompt }];
        
        if (data.description) {
            parts.push({ text: `Input: ${data.description}` });
        }
        
        if (data.media) {
            const mimeType = data.media.split(';')[0].split(':')[1];
            const base64Data = data.media.split(',')[1];
            parts.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data } });
        }
        
        const result = await model.generateContent(parts);
        const responseText = result.response.text();
        const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedResponse);
    } catch (e) {
        console.error('AI analysis error:', e.message);
        return { cat: "Pending", sev: "STABLE", act: "Awaiting human triage.", trans: data.description || "" };
    }
}

// LIGHTWEIGHT AI-ONLY ROUTE: POST /api/analyze
// Client writes to Firestore directly, then calls this for AI analysis only
app.post('/api/analyze', async (req, res) => {
    try {
        const data = req.body;
        const aiResult = await analyzeCrisisAI(data);
        res.json({ success: true, aiResult });
    } catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// SECURE BACKEND ROUTE: POST /api/sos
app.post('/api/sos', async (req, res) => {
    try {
        const data = req.body;
        
        // 1. Run Gemini AI Predictive Analysis
        const aiResult = await analyzeCrisisAI(data);
        
        // 2. Prepare Incident Record
        const newIncident = {
            id: Date.now().toString(),
            location: data.location,
            description: data.description,
            media: data.media || null,
            coords: data.coords || null,
            type: aiResult.cat,
            priority: aiResult.sev,
            aiAdvice: aiResult.act,
            translatedDesc: aiResult.trans,
            status: 'Pending',
            timestamp: new Date().toLocaleTimeString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            reportedBy: data.reportedBy || 'anonymous'
        };

        // 3. Securely write to Firestore using Admin SDK
        if (!db) throw new Error("Firestore Admin not initialized");
        const docRef = await db.collection('incidents').add(newIncident);
        
        res.json({ success: true, id: docRef.id, aiResult });
    } catch (error) {
        console.error('Error processing SOS:', error);
        res.status(500).json({ error: error.message });
    }
});

// SECURE BACKEND ROUTE: POST /api/broadcast
app.post('/api/broadcast', async (req, res) => {
    try {
        const data = req.body;
        const newBroadcast = {
            message: data.message,
            time: new Date().toLocaleTimeString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (!db) throw new Error("Firestore Admin not initialized");
        const docRef = await db.collection('broadcasts').add(newBroadcast);
        
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error('Error broadcasting:', error);
        res.status(500).json({ error: error.message });
    }
});

// SECURE BACKEND ROUTE: POST /api/incident/status
app.post('/api/incident/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!db) throw new Error("Firestore Admin not initialized");
        
        await db.collection('incidents').doc(id).update({ status });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log('--------------------------------------------');
    console.log(`🚀 RESQNET CORE (SERVERLESS API) ACTIVE ON PORT ${PORT}`);
    console.log(`📋 Staff emails configured: ${STAFF_EMAILS.length}`);
    console.log('--------------------------------------------');
});