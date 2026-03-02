/**
 * MediBot Controller — AI-powered health assistant using Google Gemini API (free tier).
 * Supports text, image analysis, and Nepali language.
 */

const config = require('../config');
const { query } = require('../database/db');
const { BadRequestError } = require('../utils/errors');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are MediBot, an AI health assistant for MediReach — an online pharmacy in Nepal.

Your role:
- Help customers identify medicines for common health problems
- Provide basic health advice and suggest over-the-counter medicines
- Recommend when to see a doctor for serious symptoms
- Answer questions about medicine usage, dosage, and side effects
- Help navigate the MediReach platform (ordering, prescriptions, delivery, payment)
- Analyze medical images (rashes, wounds, medicine packaging, prescriptions) when users share photos
- Communicate fluently in both English and Nepali (नेपाली)

Important rules:
1. ALWAYS add a disclaimer: you are not a doctor, and for serious conditions they should consult a healthcare professional
2. When suggesting medicines, mention both brand name and generic name when possible
3. Keep responses concise (2-4 short paragraphs max)
4. For prescription medicines, remind them they need a valid prescription uploaded on MediReach
5. Use Nepali context — mention medicines commonly available in Nepal
6. If they describe serious symptoms (chest pain, severe bleeding, difficulty breathing, etc.), tell them to call emergency services or visit the nearest hospital immediately
7. Be warm and empathetic
8. Format responses with line breaks for readability
9. When suggesting medicines from MediReach, mention they can search for them in the Medicine Catalog
10. LANGUAGE: Detect the user's language automatically. If the user writes in Nepali (नेपाली), respond entirely in Nepali. If they write in English, respond in English. If they mix both, respond in the language they used more. Always match the user's language preference.
11. When analyzing images: describe what you see, identify any visible condition if possible, suggest OTC remedies or recommend seeing a doctor. NEVER diagnose definitively from an image — always recommend professional consultation for serious concerns.

Available medicine categories on MediReach: Pain Relief, Antibiotics, Vitamins & Supplements, Digestive Health, Cold & Flu, Skin Care, Allergy, Diabetes, Heart Health, First Aid.
Payment methods: Cash on Delivery (COD), eSewa.
Delivery: Across Nepal, Rs. 50 fee (free above Rs. 500).`;

/**
 * POST /api/chat
 * Body: { message, history?, image?, language? }
 * image: { mimeType: "image/jpeg"|"image/png"|..., data: "<base64>" }
 * language: "en" | "ne" (optional hint)
 * Returns AI response
 */
async function chat(req, res, next) {
  try {
    const { message, history, image, audio, language } = req.body;

    if ((!message || !message.trim()) && !image && !audio) {
      throw new BadRequestError('Message, image, or audio is required');
    }

    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      return res.json({
        success: true,
        data: { reply: getFallbackReply(message || '', language) },
      });
    }

    // Build conversation contents for Gemini
    const contents = [];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        const parts = [{ text: msg.text || '' }];
        // If a history message had an image, we don't re-send it (too large)
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts,
        });
      }
    }

    // Build current user message parts
    const userParts = [];

    // Add image if provided (Gemini vision)
    if (image && image.data && image.mimeType) {
      userParts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data, // base64-encoded image
        },
      });
    }

    // Add audio if provided (Gemini audio understanding)
    if (audio && audio.data && audio.mimeType) {
      userParts.push({
        inline_data: {
          mime_type: audio.mimeType,
          data: audio.data, // base64-encoded audio
        },
      });
    }

    // Add text message
    const textMsg = message?.trim() || (image ? 'Please analyze this image and help me.' : (audio ? 'Please listen to this voice message and help me. Respond in the same language the speaker used.' : ''));
    if (textMsg) {
      userParts.push({ text: textMsg });
    }

    contents.push({
      role: 'user',
      parts: userParts,
    });

    // Fetch available medicines from DB
    let medicineContext = '';
    try {
      const { rows } = await query(
        'SELECT name, generic_name, category, price, requires_prescription FROM medicines WHERE stock > 0 ORDER BY name LIMIT 50'
      );
      if (rows.length > 0) {
        medicineContext = '\n\nAvailable medicines on MediReach right now:\n' +
          rows.map(m => `- ${m.name} (${m.generic_name || 'N/A'}) — ${m.category}, Rs. ${m.price}${m.requires_prescription ? ' [Prescription Required]' : ''}`).join('\n');
      }
    } catch {
      // Ignore DB errors for context enrichment
    }

    // Build system prompt with optional language hint
    let systemText = SYSTEM_PROMPT + medicineContext;
    if (language === 'ne') {
      systemText += '\n\nIMPORTANT: The user prefers Nepali (नेपाली). Please respond in Nepali language using Devanagari script.';
    }

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemText }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', result);
      return res.json({
        success: true,
        data: { reply: getFallbackReply(message || '', language) },
      });
    }

    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.json({
        success: true,
        data: { reply: getFallbackReply(message || '', language) },
      });
    }

    return res.json({
      success: true,
      data: { reply },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Fallback keyword-based replies when Gemini API is unavailable.
 */
function getFallbackReply(message, language) {
  const lower = (message || '').toLowerCase();
  const isNepali = language === 'ne' || /[\u0900-\u097F]/.test(message);

  if (isNepali) {
    if (lower.includes('टाउको') || lower.includes('दुख')) {
      return 'टाउको दुखेको छ भने Paracetamol (Cetamol 500mg) प्रयोग गर्न सक्नुहुन्छ — MediReach मा उपलब्ध छ। बारम्बार टाउको दुखेमा डाक्टरसँग सल्लाह लिनुहोस्।\n\n⚠️ म AI सहायक हुँ, डाक्टर होइन।';
    }
    if (lower.includes('ज्वरो')) {
      return 'ज्वरो आएमा Paracetamol (500mg) प्रयोग गर्नुहोस्। पानी धेरै पिउनुहोस्। ३ दिनभन्दा बढी ज्वरो रहेमा डाक्टरकहाँ जानुहोस्।\n\n⚠️ म AI सहायक हुँ, डाक्टर होइन।';
    }
    if (lower.includes('रुघा') || lower.includes('खोकी')) {
      return 'रुघा खोकीका लागि Cetrizine र खोकीको औषधि प्रयोग गर्न सक्नुहुन्छ। तातो पानी पिउनुहोस्।\n\nMediReach को Cold & Flu category मा हेर्नुहोस्।\n\n⚠️ म AI सहायक हुँ, डाक्टर होइन।';
    }
    return 'नमस्ते! म MediBot हुँ, तपाईंको AI स्वास्थ्य सहायक। 🩺\n\nतपाईंले:\n• आफ्नो लक्षणहरू बताउन सक्नुहुन्छ\n• औषधिको बारेमा सोध्न सक्नुहुन्छ\n• फोटो पठाएर सहायता लिन सक्नुहुन्छ\n• अर्डर, प्रेस्क्रिप्सन, डेलिभरी बारे सोध्न सक्नुहुन्छ\n\nम कसरी मद्दत गर्न सक्छु?';
  }

  if (lower.includes('headache') || lower.includes('head pain')) {
    return "For headaches, you can try Paracetamol (Cetamol 500mg) — available on MediReach without prescription. If headaches are frequent or severe, please consult a doctor.\n\n⚠️ I'm an AI assistant, not a doctor. Always consult a healthcare professional for persistent symptoms.";
  }
  if (lower.includes('fever')) {
    return "For fever, Paracetamol (500mg) is commonly used. Stay hydrated and rest. If fever persists beyond 3 days or exceeds 103°F, please see a doctor.\n\nSearch 'Paracetamol' in our Medicine Catalog.\n\n⚠️ I'm an AI assistant, not a doctor.";
  }
  if (lower.includes('cold') || lower.includes('flu') || lower.includes('cough')) {
    return "For cold & flu symptoms, try Cetrizine for runny nose, and a cough syrup. You can find these in our Cold & Flu category.\n\nDrink warm fluids and rest. See a doctor if symptoms last more than a week.\n\n⚠️ I'm an AI assistant, not a doctor.";
  }
  if (lower.includes('stomach') || lower.includes('digestion') || lower.includes('acidity')) {
    return "For digestive issues, Antacids or Omeprazole can help with acidity. For diarrhea, ORS (Oral Rehydration Salts) is important. Check our Digestive Health category.\n\n⚠️ I'm an AI assistant, not a doctor.";
  }
  if (lower.includes('pain') || lower.includes('body ache')) {
    return "For body pain, Ibuprofen or Paracetamol can help. For muscle pain, a topical pain relief cream may also be useful. Browse our Pain Relief category.\n\n⚠️ I'm an AI assistant, not a doctor. Consult a professional if pain is severe or persistent.";
  }
  if (lower.includes('allergy') || lower.includes('allergic')) {
    return "For allergic reactions, antihistamines like Cetrizine or Loratadine can help. Available in our Allergy category. For severe allergic reactions (difficulty breathing, swelling), seek emergency medical help immediately!\n\n⚠️ I'm an AI assistant, not a doctor.";
  }
  if (lower.includes('medicine') || lower.includes('search')) {
    return "You can browse all medicines in the Medicine Catalog. Use the search bar to find specific medicines, or filter by category (Pain Relief, Vitamins, Cold & Flu, etc.).";
  }
  if (lower.includes('order') || lower.includes('track')) {
    return "Check 'My Orders' to see all your orders. Use 'Track Order' to see real-time status. Orders go through: Pending → Verified → Packed → Shipped → Delivered.";
  }
  if (lower.includes('prescription')) {
    return "Upload your prescription on the Prescriptions page. Our pharmacists verify it — once approved, you can order prescription-only medicines.";
  }
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('esewa')) {
    return "We accept Cash on Delivery (COD) and eSewa. Select your preferred method at checkout. All digital payments are secure.";
  }
  if (lower.includes('delivery') || lower.includes('shipping')) {
    return "We deliver across Nepal! Delivery fee is Rs. 50 (free for orders above Rs. 500). Kathmandu Valley: 1-3 days, Other areas: 3-5 days.";
  }

  return "Hi! I'm MediBot, your AI health assistant. 🩺\n\nYou can:\n• Describe your symptoms and I'll suggest medicines\n• Send a photo for analysis\n• Ask about medicines, dosage, or side effects\n• Get help with orders, prescriptions, delivery, or payment\n\nHow can I help you today?";
}

/**
 * POST /api/chat/transcribe
 * Body: { audio: { mimeType, data }, language? }
 * Uses Gemini to transcribe audio → returns text (cross-browser mic support).
 */
async function transcribe(req, res, next) {
  try {
    const { audio, language } = req.body;
    if (!audio || !audio.data || !audio.mimeType) {
      throw new BadRequestError('Audio data is required');
    }

    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      return res.json({
        success: true,
        data: { text: '' },
      });
    }

    const langHint = language === 'ne' ? 'Nepali (नेपाली)' : 'English';

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: audio.mimeType,
                  data: audio.data,
                },
              },
              {
                text: `Transcribe this audio to text. The speaker is likely speaking ${langHint}. Return ONLY the transcription, nothing else. If you cannot understand the audio, return an empty string.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini transcribe error:', result);
      return res.json({ success: true, data: { text: '' } });
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ success: true, data: { text: text.trim() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat, transcribe };
