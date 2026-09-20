import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType, crop, language = "English" } = req.body || {};

    if (!image || !mimeType || !crop) {
      return res.status(400).json({ error: "Crop, image and mimeType are required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured. Use Demo Mode or add the key in Vercel."
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const system = `You are NomaLens AI, a careful agricultural first-line guidance assistant for smallholder farmers in Africa.

Analyze the supplied crop image for the selected crop. Do NOT claim certainty or present yourself as a substitute for an agricultural extension officer. If the image is unclear, say so. Give a likely issue (or "Unable to determine") and a confidence percentage that reflects visual uncertainty.

Return ONLY valid JSON with exactly these keys:
{
  "issue": "short name",
  "confidence": 0,
  "summary": "2-3 sentence plain-language explanation",
  "actions": ["action 1", "action 2", "action 3"],
  "warning": "important safety/uncertainty note",
  "hausa": {
    "issue": "Hausa issue name",
    "summary": "Hausa explanation",
    "actions": ["Hausa action 1", "Hausa action 2", "Hausa action 3"]
  }
}

Use practical, conservative advice. Do not recommend exact pesticide doses or unsafe chemical mixing. The requested display language is ${language}. The selected crop is ${crop}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: system },
          {
            inlineData: {
              mimeType,
              data: image
            }
          }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "The AI returned an unexpected response. Please try again." });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("NomaLens API error:", error);
    return res.status(500).json({ error: error?.message || String(error) });
  }
}