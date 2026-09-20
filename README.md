# NomaLens AI 🌱

**Your crop. Your language. Smarter decisions.**

NomaLens AI is a competition-ready MVP that provides first-line crop-health guidance from a plant image, with English/Hausa localization and a responsible-AI disclaimer.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Connect Gemini

1. Create a Gemini API key in Google AI Studio.
2. Deploy this project to Vercel.
3. In Vercel → Project Settings → Environment Variables, add:

```text
GEMINI_API_KEY=your_key
```

4. Redeploy.

The `/api/analyze.js` serverless function keeps the API key on the server.

## Demo mode

The app includes a clearly labeled **Try Demo** / **No photo? Use demo result** path so the UI can be demonstrated even before an API key is configured. For the actual submission demo, connect Gemini and show a real image analysis if possible.

## 3-minute demo flow

1. Introduce the farmer problem.
2. Click Check My Crop.
3. Select Tomato.
4. Upload a leaf photo.
5. Show AI result + confidence.
6. Click Explain in Hausa.
7. Explain that NomaLens is a first layer of guidance, not a replacement for agricultural experts.
8. Close with the impact statement.

## Submission description

NomaLens AI is a multimodal AI crop-health assistant designed to make agricultural guidance more accessible to smallholder farmers. Farmers can upload a crop image and receive a cautious visual screening, practical next steps, and an English/Hausa explanation. The MVP focuses on early access to understandable information while clearly communicating uncertainty and encouraging professional confirmation for treatment decisions.
