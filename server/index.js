// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- logger ---
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// --- root & health ---
app.get('/', (_req, res) => {
  res.send('AI server up ✅');
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    has_token: Boolean(process.env.HF_TOKEN),
    model_sr_en: process.env.HF_MODEL_SREN || '',
    model_en_sr: process.env.HF_MODEL_ENSR || '',
    port: Number(process.env.PORT) || 8081,
  });
});

/* =========================================
   /ai/suggest-ballot — Fallback only (nema HF)
   ========================================= */
app.post('/ai/suggest-ballot', async (req, res) => {
  const { topic = 'Budžet studentskog doma', language = 'sr' } = req.body || {};

  const payload = (language === 'en')
    ? {
        title: `Do you support ${topic}?`,
        options: ['Yes, approve', 'No, reject', 'Abstain'],
        rules: 'One vote per user. Results are public after closing.',
      }
    : {
        title: `Da li podržavate ${topic}?`,
        options: ['Da, usvojiti', 'Ne, odbiti', 'Uzdržan'],
        rules: 'Jedan glas po korisniku. Rezultati su javni nakon završetka.',
      };

  return res.json(payload);
});

/* ====================================================
   /ai/summary — Dinamički fallback only (nema HF)
   ==================================================== */
app.post('/ai/summary', async (req, res) => {
  const { options = [], counts = [], turnout, language = 'sr' } = req.body || {};

  const norm = (s = '') =>
    s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  const total = counts.reduce((a, b) => a + (b || 0), 0);
  const pairs = options.map((name, i) => ({
    name,
    count: counts[i] ?? 0,
    pct: total > 0 ? ((counts[i] ?? 0) / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count);

  const top = pairs[0] || { name: options[0] || 'Opcija 1', count: 0, pct: 0 };
  const second = pairs[1] || { name: options[1] || 'Opcija 2', count: 0, pct: 0 };
  const marginPct = Math.abs(top.pct - second.pct);

  const abstainIdx = options.findIndex(o => {
    const n = norm(o || '');
    return n.includes('uzdrzan') || n.includes('abstain') || n.includes('suzdrzan');
  });
  const abstainCount = abstainIdx >= 0 ? (counts[abstainIdx] || 0) : 0;
  const abstainPct = total > 0 ? (abstainCount / total) * 100 : 0;

  const turnoutVal = typeof turnout === 'number' ? turnout : null;

  const T = language === 'en'
    ? {
        leading: (n,p,c,t) => `The leading option is "${n}" with ${p.toFixed(1)}% (${c} of ${t} votes).`,
        turnout: v => v != null ? ` Turnout: ${v}%.` : '',
        kt_highAbst: 'High share of abstentions',
        kt_midAbst: 'Moderate abstentions',
        kt_lowAbst: 'Low abstentions',
        kt_strongLead: 'Strong lead / clear mandate',
        kt_narrowLead: 'Narrow lead',
        kt_tie: 'Neck-and-neck race',
        kt_highTurnout: 'High turnout',
        kt_midTurnout: 'Moderate turnout',
        kt_lowTurnout: 'Low turnout',
      }
    : {
        leading: (n,p,c,t) => `Vodeća opcija je "${n}" sa ${p.toFixed(1)}% (${c} od ${t} glasova).`,
        turnout: v => v != null ? ` Izlaznost: ${v}%.` : '',
        kt_highAbst: 'Visok udeo uzdržanih',
        kt_midAbst: 'Umeren udeo uzdržanih',
        kt_lowAbst: 'Mali udeo uzdržanih',
        kt_strongLead: 'Ubedljiva prednost / jasan mandat',
        kt_narrowLead: 'Tesna prednost',
        kt_tie: 'Praktično izjednačeno',
        kt_highTurnout: 'Visoka izlaznost',
        kt_midTurnout: 'Umerena izlaznost',
        kt_lowTurnout: 'Niska izlaznost',
      };

  const kt = [];
  if (abstainPct >= 30) kt.push(T.kt_highAbst);
  else if (abstainPct >= 10) kt.push(T.kt_midAbst);
  else kt.push(T.kt_lowAbst);

  if (marginPct >= 15) kt.push(T.kt_strongLead);
  else if (marginPct >= 5) kt.push(T.kt_narrowLead);
  else kt.push(T.kt_tie);

  if (turnoutVal != null) {
    if (turnoutVal >= 60) kt.push(T.kt_highTurnout);
    else if (turnoutVal >= 40) kt.push(T.kt_midTurnout);
    else kt.push(T.kt_lowTurnout);
  }

  const summary = T.leading(top.name, top.pct, top.count, total) + T.turnout(turnoutVal);
  return res.json({
    summary,
    key_takeaways: kt.slice(0, 3),
  });
});

/* ====================================================
   PREVOD preko Hugging Face (TOKEN → fallback)
   EN<->SR
   ==================================================== */
async function callHfTranslateModel(model, text) {
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN || !model) throw new Error('HF token ili model nije podešen');

  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}?wait_for_model=true`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`[HF ${model}] ${r.status} ${txt.slice(0,200)}`);
  }

  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    throw new Error(`[HF ${model}] JSON parse error: ${e?.message || e}`);
  }

  // Opus-MT: [{ translation_text: "..." }]
  if (Array.isArray(data) && data[0]?.translation_text) {
    return String(data[0].translation_text).trim();
  }
  if (data?.translation_text) return String(data.translation_text).trim();

  // fallback ako pipeline vrati generated_text
  if (Array.isArray(data) && data[0]?.generated_text) {
    return String(data[0].generated_text).trim();
  }
  if (data?.generated_text) return String(data.generated_text).trim();

  throw new Error(`[HF ${model}] Nepoznat format: ${JSON.stringify(data).slice(0,200)}`);
}

async function hfTranslate(text, from, to) {
  const model =
    (from === "en" && to === "sr") ? process.env.HF_MODEL_ENSR :
    (from === "sr" && to === "en") ? process.env.HF_MODEL_SREN :
    null;
  if (!model) throw new Error('Nije definisan odgovarajući HF_MODEL_* u .env');
  return callHfTranslateModel(model, text);
}

// Fallback prevodioci
async function translateMyMemory(text, to, from) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
  const r = await fetch(url, { method: "GET" });
  const data = await r.json().catch(() => null);
  if (r.ok && data?.responseData?.translatedText) {
    return String(data.responseData.translatedText).trim();
  }
  throw new Error(`MyMemory: ${r.status}`);
}

async function translateLibre(text, to, from) {
  // primarna javna instanca
  let r = await fetch("https://translate.astian.org/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: from, target: to, format: "text" })
  });
  let data = await r.json().catch(() => null);
  if (r.ok && data?.translatedText) return String(data.translatedText).trim();

  // alternativna javna instanca
  r = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: from, target: to, format: "text" })
  });
  data = await r.json().catch(() => null);
  if (r.ok && data?.translatedText) return String(data.translatedText).trim();

  throw new Error("Libre both endpoints failed");
}

/* --------------------------------
   /ai/rephrase — PREVOD (HF → MyMemory → Libre)
   Body: { text: string, language?: "sr"|"en" }
----------------------------------*/
app.post("/ai/rephrase", async (req, res) => {
  const { text = "", language = "sr" } = req.body || {};
  const to = language === "en" ? "en" : "sr";   // cilj
  const from = language === "en" ? "sr" : "en"; // polazni

  try {
    // 1) Hugging Face (tvoj token + Opus-MT)
    const outHF = await hfTranslate(text, from, to);
    return res.json({ text: outHF });
  } catch (err) {
    console.warn("HF translate fail:", err?.message || err);
  }

  try {
    // 2) MyMemory fallback
    const outMM = await translateMyMemory(text, to, from);
    console.log("MyMemory OK");
    return res.json({ text: outMM });
  } catch (e) {
    console.warn("MyMemory fail:", e?.message || e);
  }

  try {
    // 3) LibreTranslate fallback (dve javne instance)
    const outLT = await translateLibre(text, to, from);
    console.log("Libre OK");
    return res.json({ text: outLT });
  } catch (e2) {
    console.warn("Libre fail:", e2?.message || e2);
  }

  // 4) Nikad 500 — vrati bar original da UI radi
  return res.json({ text });
});

/* --------------------------------
   start
----------------------------------*/
const PORT = Number(process.env.PORT) || 8081;
app.listen(PORT, () => {
  console.log(`AI server on :${PORT}`);
});
