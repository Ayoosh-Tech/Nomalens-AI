import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const crops = [
  { id: "tomato", name: "Tomato", emoji: "🍅" },
  { id: "maize", name: "Maize", emoji: "🌽" },
  { id: "pepper", name: "Pepper", emoji: "🌶️" },
  { id: "potato", name: "Potato", emoji: "🥔" },
];

const demoResults = {
  tomato: {
    issue: "Possible Early Blight",
    confidence: 82,
    summary: "The leaf shows spots and discoloration that may be consistent with early blight. This is a visual screening, not a confirmed diagnosis.",
    actions: [
      "Remove severely affected leaves and dispose of them away from healthy plants.",
      "Improve spacing and airflow around the plants.",
      "Avoid keeping the leaves wet for long periods."
    ],
    warning: "For confirmation or treatment decisions, consult an agricultural extension officer.",
    hausa: {
      issue: "Ana zargin Early Blight na tumatir",
      summary: "Ganyen yana nuna tabo da canjin launi wanda zai iya kasancewa da cutar Early Blight. Wannan hasashe ne daga hoto kawai, ba tabbataccen bincike ba.",
      actions: [
        "Cire ganyen da cutar ta shafa sosai.",
        "Ka kara tazara da iska tsakanin tsirrai.",
        "Ka guji barin ganyen ya jike na dogon lokaci."
      ]
    }
  },
  maize: {
    issue: "Possible Leaf Spot",
    confidence: 78,
    summary: "The image may show a leaf-spot pattern. More information and a clearer image are needed for confirmation.",
    actions: [
      "Remove badly damaged plant material where practical.",
      "Keep the field clean of heavily infected debris.",
      "Monitor nearby plants for similar symptoms."
    ],
    warning: "A local agricultural professional should confirm the cause before treatment.",
    hausa: {
      issue: "Ana zargin tabon ganyen masara",
      summary: "Hoton na iya nuna tabo a jikin ganyen masara. Ana bukatar karin bayani ko hoto mai kyau domin tabbatarwa.",
      actions: [
        "Cire sassan da suka lalace sosai idan ya dace.",
        "Ka tsaftace tarkacen tsirran da suka kamu.",
        "Ka rika duba sauran tsirrai don ganin ko suna nuna irin wannan alama."
      ]
    }
  }
};

function App() {
  const [step, setStep] = useState("home");
  const [crop, setCrop] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [lang, setLang] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCrop = useMemo(() => crops.find(c => c.id === crop), [crop]);
  const isHausa = lang === "Hausa";

  const start = () => {
    setError("");
    setStep("crop");
  };

  const chooseCrop = (id) => {
    setCrop(id);
    setError("");
    setStep("upload");
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("Please choose an image smaller than 8MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const toBase64 = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

  const analyze = async () => {
    if (!file || !crop) {
      setError("Please select a crop and upload a clear photo.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const base64 = await toBase64(file);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
          crop,
          language: lang
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const demo = () => {
    const fallback = demoResults[crop] || demoResults.tomato;
    setResult(fallback);
    setStep("result");
    setError("");
  };

  const reset = () => {
    setStep("home");
    setCrop(null);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const resultIssue = isHausa ? result?.hausa?.issue : result?.issue;
  const resultSummary = isHausa ? result?.hausa?.summary : result?.summary;
  const resultActions = isHausa ? result?.hausa?.actions : result?.actions;

  return (
    <div className="app">
      <header className="nav">
        <button className="brand" onClick={reset} aria-label="NomaLens home">
          <span className="brand-mark">N</span>
          <span>NomaLens <b>AI</b></span>
        </button>
        <div className="nav-right">
          <button className="lang" onClick={() => setLang(isHausa ? "English" : "Hausa")}>
            {isHausa ? "EN" : "HA"} <span>↔</span>
          </button>
          <span className="status"><i /> AI crop guide</span>
        </div>
      </header>

      <main>
        {step === "home" && (
          <section className="hero page">
            <div className="hero-copy">
              <div className="eyebrow">SMART AGRICULTURE • BUILT FOR AFRICA</div>
              <h1>Your crop.<br /><span>Your language.</span><br />Smarter decisions.</h1>
              <p>NomaLens AI uses image analysis to give farmers a quick first layer of crop-health guidance — in English or Hausa.</p>
              <div className="hero-actions">
                <button className="primary" onClick={start}>Check My Crop <span>→</span></button>
                <button className="secondary" onClick={() => { setCrop("tomato"); demo(); }}>Try Demo</button>
              </div>
              <div className="trust-row">
                <span>📷 Photo-based</span><span>🌍 English + Hausa</span><span>⚠️ Responsible AI</span>
              </div>
            </div>
            <div className="hero-card">
              <div className="scan-glow" />
              <div className="leaf-art">🌿</div>
              <div className="scan-line" />
              <div className="hero-card-label"><span>AI VISION</span><b>Crop health screening</b></div>
              <div className="floating-chip chip-one">🍅 Tomato</div>
              <div className="floating-chip chip-two">82% confidence</div>
            </div>
          </section>
        )}

        {step === "crop" && (
          <section className="page flow">
            <div className="step-label">STEP 1 OF 3</div>
            <h2>What crop are you checking?</h2>
            <p className="sub">Choose the crop that best matches your photo.</p>
            <div className="crop-grid">
              {crops.map(c => (
                <button key={c.id} className="crop-card" onClick={() => chooseCrop(c.id)}>
                  <span>{c.emoji}</span><b>{c.name}</b><small>Check crop health</small>
                </button>
              ))}
            </div>
            <button className="back" onClick={() => setStep("home")}>← Back</button>
          </section>
        )}

        {step === "upload" && (
          <section className="page flow narrow">
            <div className="step-label">STEP 2 OF 3</div>
            <h2>Upload a clear photo</h2>
            <p className="sub">Show the affected leaf or plant as clearly as possible.</p>
            <label className={`upload ${preview ? "has-image" : ""}`}>
              {preview ? <img src={preview} alt="Selected crop" /> : <><span className="upload-icon">📷</span><b>Tap to choose a photo</b><small>JPG, PNG • up to 8MB</small></>}
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>
            {error && <div className="error">⚠ {error}</div>}
            <div className="upload-actions">
              <button className="secondary" onClick={() => setStep("crop")}>← Change crop</button>
              <button className="primary" disabled={!file || loading} onClick={analyze}>
                {loading ? "Analyzing…" : "Analyze with AI →"}
              </button>
            </div>
            <button className="demo-link" onClick={demo}>No photo? Use demo result</button>
          </section>
        )}

        {step === "result" && result && (
          <section className="page result-page">
            <div className="result-top">
              <div>
                <div className="step-label">AI CROP SCREENING</div>
                <h2>{resultIssue}</h2>
                <p className="sub">{selectedCrop?.emoji} {selectedCrop?.name || "Crop"} • {isHausa ? "Hausa" : "English"}</p>
              </div>
              <div className="confidence"><strong>{result.confidence}%</strong><span>confidence</span></div>
            </div>

            <div className="result-grid">
              <div className="result-main">
                {preview && <img className="result-image" src={preview} alt="Analyzed crop" />}
                <div className="result-box">
                  <span className="box-label">WHAT WE FOUND</span>
                  <p>{resultSummary}</p>
                </div>
                <div className="result-box">
                  <span className="box-label">WHAT YOU CAN DO</span>
                  <ul>{resultActions?.map((a, i) => <li key={i}><span>✓</span>{a}</li>)}</ul>
                </div>
              </div>
              <aside>
                <div className="language-card">
                  <div className="language-head"><b>{isHausa ? "Hausa guidance" : "Need Hausa?"}</b><button onClick={() => setLang(isHausa ? "English" : "Hausa")}>{isHausa ? "English" : "Explain in Hausa"}</button></div>
                  {!isHausa && <p>Make the result easier to understand in Hausa for local communication.</p>}
                  {isHausa && <p className="hausa-note">An fassara sakamakon domin saukin fahimta.</p>}
                </div>
                <div className="warning"><b>⚠ Important</b><p>{result.warning}</p></div>
                <button className="primary full" onClick={reset}>Check Another Crop</button>
              </aside>
            </div>
            <div className="responsible"><b>Responsible AI:</b> NomaLens provides visual first-line guidance. It does not replace qualified agricultural professionals.</div>
          </section>
        )}

        {error && step === "result" && <div className="error page-error">⚠ {error}</div>}
      </main>

      <footer>
        <span>© 2026 NomaLens AI</span>
        <span>Built to make agricultural guidance more accessible.</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);