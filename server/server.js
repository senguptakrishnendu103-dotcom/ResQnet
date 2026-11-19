- `rateLimit` from `express-rate-limit`
- `body` and `validationResult` from `express-validator`

I need to add these imports to the existing imports section while preserving all other code exactly as-is.

Let me find the imports section in the original code and add the new imports.require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

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

// --- Authentication Middleware ---
async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        req.user = await getAuth().verifyIdToken(token);
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

function requireStaff(req, res, next) {
    const email = req.user?.email?.toLowerCase();
    if (!email || !STAFF_EMAILS.includes(email)) {
        return res.status(403).json({ error: 'Forbidden: Staff access required' });
    }
    next();
}

// --- Gemini Configuration (from .env) ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// --- Staff email whitelist ---
const DEFAULT_STAFF = 'senguptakrishnendu103@gmail.com,staff@resqnet.com,admin@resqnet.com';
const STAFF_EMAILS = (process.env.STAFF_EMAILS || DEFAULT_STAFF).split(',').map(e => e.trim().toLowerCase());

// --- Rate Limiting & Validation Middleware ---
const sosLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    message: { error: 'Too many SOS requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const validateSOS = [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('media').optional().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateBroadcast = [
    body('message').trim().notEmpty().withMessage('Broadcast message is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ResQnet Core API', timestamp: new Date().toISOString() });
});

app.get('/api/staff', requireAuth, (req, res) => {
    res.json({ staffEmails: STAFF_EMAILS });
});

async function analyzeCrisisAI(data) {
    try {
        const prompt = `Act as an emergency AI dispatcher. Analyze the input.
        Return ONLY valid JSON with no markdown wrapping: {"cat": "Medical/Fire/Security/Earthquake", "sev": "CRITICAL/STABLE", "act": "One instruction", "trans": "English translation"}`;
        const parts = [{ text: prompt }];

        if (data.description) {
            parts.push({ text: `Input: ${data.description}` });
        }

        if (data.media && typeof data.media === 'string' && data.media.startsWith('data:')) {
            const match = data.media.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
                const mimeType = match[1] || "image/jpeg";
                const base64Data = match[2];
                parts.push({ inlineData: { mimeType, data: base64Data } });
            }
        }
        const result = await model.generateContent(parts);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No JSON object found in model output: " + responseText);
    } catch (e) {
        console.error('AI analysis error:', e.message);
        throw e; // Re-throw to let caller handle
    }
}

// LIGHTWEIGHT AI-ONLY ROUTE: POST /api/analyze
// Client writes to Firestore directly, then calls this for AI analysis only
app.post('/api/analyze', requireAuth, async (req, res) => {
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
app.post('/api/sos', sosLimiter, requireAuth, validateSOS, async (req, res) => {
    try {
        const data = req.body;

        // 1. Run Gemini AI Predictive Analysis
        let aiResult;
        let aiStatus = 'completed';
        try {
            aiResult = await analyzeCrisisAI(data);
        } catch (aiError) {
            console.error('AI analysis failed, using fallback:', aiError.message);
            aiResult = { cat: "Pending", sev: "STABLE", act: "Awaiting human triage.", trans: data.description || "" };
            aiStatus = 'failed';
        }

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
            aiStatus: aiStatus,
            timestamp: new Date().toLocaleTimeString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            reportedBy: data.reportedBy || 'anonymous'
        };

        // 3. Securely write to Firestore using Admin SDK
        if (!db) throw new Error("Firestore Admin not initialized");
        const docRef = await db.collection('incidents').add(newIncident);
        
        // Emit real-time event to staff
        const incidentForStaff = { ...newIncident, firebaseId: docRef.id };
        io.to('staff').emit('new-incident', incidentForStaff);
        res.json({ success: true, id: docRef.id, aiResult, aiStatus });
    } catch (error) {
        console.error('Error processing SOS:', error);
        res.status(500).json({ error: error.message });
    }
});

// SECURE BACKEND ROUTE: POST /api/broadcast
app.post('/api/broadcast', requireAuth, requireStaff, validateBroadcast, async (req, res) => {
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

const validateStatusUpdate = [
    body('id').trim().notEmpty().withMessage('Incident ID is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// SECURE BACKEND ROUTE: POST /api/incident/status
app.post('/api/incident/status', requireAuth, requireStaff, validateStatusUpdate, async (req, res) => {
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

// --- Socket.io Connection Handling ---
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-staff', () => {
        socket.join('staff');
        console.log('Staff joined room:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log('--------------------------------------------');
    console.log(`🚀 RESQNET CORE (SERVERLESS API) ACTIVE ON PORT ${PORT}`);
    console.log(`📋 Staff emails configured: ${STAFF_EMAILS.length}`);
    console.log('--------------------------------------------');
});