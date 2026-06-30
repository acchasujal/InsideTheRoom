# Inside the Room

> **Discretion Disclosure:** Making AI Governance Auditable  
> Surface undefined terms. Prove discretion risk. Generate compliance artifacts.

Every rulebook — FIFA's, your insurer's, your content policy's — contains words like *"deliberately"* or *"reasonable"* that are undefined on purpose. Those undefined words are where discretion lives, where lawsuits begin, and where AI systems fail silently.

**Inside the Room** is the first interactive instrument for operationalizing H.L.A. Hart's open-texture doctrine. Using IBM Granite, it surfaces interpretive ambiguity in any governing text, generates a compliance-grade Discretion Disclosure Report, and documents exactly where rules become judgment calls.

Demonstrated through World Cup incidents. Designed for enterprise AI governance.

---

## 🎯 The Problem

AI governance focuses on model risk (bias, hallucination). But there's a deeper problem: **discretion risk** — the judgment gap that law itself preserves.

When FIFA Law 12 says a handball must be *"deliberately played,"* the law never defines what *"deliberately"* means. That's not an oversight. It's by design. The law preserves discretion on purpose, knowing that infinite real-world variation can't be reduced to formal rules.

AI systems treat undefined terms as solvable problems. They're not. They're features of any governing system — insurance contracts, content moderation policy, hiring criteria. When AI encounters these gaps with false confidence, it fails silently.

---

## 💡 The Solution

Inside the Room uses IBM Granite to **map the interpretive landscape** in any governing text:

### **Four-Phase Exploration**

**①  Framing Test** (`/live`)
- Submit an incident in neutral vs. loaded language
- Watch Granite's 4-perspective reasoning shift based on framing alone
- Proves: Language is not neutral; it carries discretion vectors
- Enterprise value: Detects hidden bias in how incidents are reported

**② Knowledge Graph** (`/heatmap`)
- Visual explorer of undefined terms and ambiguity hotspots
- Interpretation spread scoring (0–100 per interpretive school)
- Cluster analysis: which terms create the most interpretive variance?
- Enterprise value: Regulatory audit preparation

**③ Incident Review** (`/incident/:id`)
- 5 real World Cup controversies analyzed through Granite's 4-persona engine:
  - **Fan (Purposive)**: What was the intent/spirit of the rule?
  - **Referee (Contextual)**: What do the facts show?
  - **VAR (Procedural)**: Did we follow process?
  - **Rulebook (Strict Constructionist)**: What's the literal interpretation?
- Two-decision mechanic: Decide before seeing law. Decide after. Compare your shift.
- Incidents: Perišić (intent), De Jong (threshold), VAR Nested (judgment), Mbappé (scope), Suárez (context)
- Enterprise value: Demonstrates that ambiguity is structural, not fixable by more data

**④ Governance Diagnostics** (`/live?show_diagnostics=true`)
- Compliance-grade audit trail: request ID, inference duration, token usage, latency
- Response schema validation: ensures discretion reasoning is structured and auditable
- Discretion Disclosure Report: exportable markdown documenting interpretive variance
- Enterprise value: Proof of transparency for regulators and stakeholders

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                            │
│  ├─ Home: 4-phase journey with progress indicator   │
│  ├─ /live: Framing Test + Governance Diagnostics    │
│  ├─ /heatmap: Knowledge Graph (D3 visualization)    │
│  └─ /incident/:id: Two-decision mechanic incident   │
└────────────────────┬────────────────────────────────┘
                     │
                 HTTP API (JSON)
                     │
┌────────────────────▼────────────────────────────────┐
│  Vercel Serverless Functions (/api/generate)        │
│  ├─ Request validation & deduplication              │
│  ├─ LRU cache for preset incident responses         │
│  ├─ In-flight request pooling (prevent double-call) │
│  └─ Graceful fallback to reference benchmarks       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   [Mode: Live]          [Mode: Preset/Cache]
        │                         │
        └────────┬────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  IBM watsonx.ai (Granite LLM)                       │
│  ├─ Model: ibm/granite-13b-chat-v2                  │
│  ├─ Input: Incident text + 4-persona structured    │
│  │    prompt                                        │
│  ├─ Output: Perspectives + ambiguity score +        │
│  │    interpretation spread (0–100 per school)      │
│  └─ Auth: Zero-trust IAM token generation           │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, React Router 7 | UI framework + routing |
| **Styling** | CSS3 variables, Glassmorphism | Premium dark aesthetic |
| **State** | React Context + useState | Demo flow + navigation state |
| **Backend** | Vercel Serverless Functions | API gateway + request deduplication |
| **AI Model** | IBM Granite (watsonx.ai) | Perspective generation + reasoning |
| **Auth** | IBM IAM (OAuth 2.0) | Secure token exchange + renewal |
| **Caching** | LRU Cache (in-memory) | Reference benchmark performance |
| **Data** | incidents.json | 5 validated incident cases |
| **Deployment** | Vercel + GitHub | CI/CD + edge compute |

---

## 📋 Core Incident Data

Each incident contains:

```json
{
  "id": "perisic",
  "title": "Perišić Handball (2018 World Cup Final)",
  "theme": "Intent / Threshold Blend",
  "ambiguityScore": 8.5,
  "tensionTerm": "deliberately",
  "lawInvolved": "Law 12 (Fouls and Misconduct)",
  "perspectives": [
    { "persona": "Fan", "text": "..." },
    { "persona": "Referee", "text": "..." },
    { "persona": "VAR", "text": "..." },
    { "persona": "Rulebook", "text": "..." }
  ],
  "structuralTension": "...",
  "decision1Options": ["Penalty", "No Penalty"],
  "decision2Options": ["My call was correct", "The law is ambiguous"],
  "reflection": "..."
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- IBM Cloud account (for watsonx.ai credentials)

### 1. Clone & Install
```bash
git clone https://github.com/acchasujal/InsideTheRoom.git
cd InsideTheRoom
npm install
```

### 2. Environment Variables
Create `.env` in project root:
```env
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
VITE_WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
```

### 3. Local Development
```bash
npm run dev
# Opens http://localhost:5173
```

### 4. Production Build
```bash
npm run build
npm run preview
```

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

Then add environment variables in Vercel Project Settings.

---

## 📁 Project Structure

```
InsideTheRoom/
├─ src/
│  ├─ pages/
│  │  ├─ Home.tsx              # Hero + 4-phase journey navigation
│  │  ├─ IncidentContainer.tsx  # Two-decision incident flow
│  │  ├─ LiveGeneration.tsx     # Framing Test + Governance Diagnostics
│  │  └─ HeatmapDemo.tsx        # Knowledge Graph (D3 visualization)
│  ├─ components/
│  │  ├─ DecisionPanel.tsx      # Two-button decision UI
│  │  ├─ PerspectiveCard.tsx    # Individual persona reasoning card
│  │  ├─ InterpretationSpreadHero.tsx  # Ambiguity score visualization
│  │  ├─ AmbiguityHeatmap.tsx   # Term highlighting + heatmap
│  │  └─ RevealSection.tsx      # Defined term reveal component
│  ├─ context/
│  │  └─ DemoContext.tsx        # Demo mode state + incident navigation
│  ├─ utils/
│  │  ├─ mockApi.ts            # API client (calls /api/generate)
│  │  └─ [other utilities]
│  ├─ data/
│  │  └─ incidents.json         # 5 incident dataset
│  └─ App.tsx                   # Routes + Layout wrapper
├─ api/
│  ├─ generate.ts              # Vercel function: Granite orchestration
│  ├─ health.ts                # Vercel function: Health check
│  ├─ utils.ts                 # IBM IAM token exchange + fetch retry
│  └─ self-test.ts             # Vercel function: Self-diagnostic
├─ docs/                        # Strategy + architecture docs
├─ public/                      # Static assets (images, icons)
├─ package.json
└─ vercel.json                 # Vercel deployment config

```

---

## 🔌 Granite AI Pipeline

### Input
```
You are an expert rules interpreter. Analyze the following incident 
and provide 4 perspectives: Fan (Purposive), Referee (Contextual), 
VAR (Procedural), Rulebook (Strict Constructionist).

Identify the undefined term. Rate ambiguity 1–10.

Incident: "{user_provided_text}"
```

### Output Structure
```json
{
  "retrievedLaw": "Law 12 - Fouls and Misconduct...",
  "tensionTerm": "deliberately",
  "ambiguityScore": 8.5,
  "interpretationSpread": {
    "purposive": 85,
    "contextual": 40,
    "procedural": 65,
    "strict": 50
  },
  "perspectives": [
    { "persona": "Fan", "text": "..." },
    { "persona": "Referee", "text": "..." },
    { "persona": "VAR", "text": "..." },
    { "persona": "Rulebook", "text": "..." }
  ]
}
```

### Modes
- **Preset Mode** (`mode: 'preset'`): Returns cached reference responses (5 incidents)
- **Live Mode** (`mode: 'live'`): Calls watsonx.ai with user-submitted text
- **Framing Sensitivity** (optional `loadedText`): Dual perspective generation (neutral + loaded)

### Error Handling
- Timeout: 25 seconds (client-side), 30 seconds (Vercel)
- Fallback: Graceful degradation to reference benchmarks with explicit "FALLBACK" badge
- Validation: JSON schema enforcement on all responses

---

## 🎭 Governance & Responsible AI

**Transparency First:**
- All outputs labeled "Live Granite" or "Reference Benchmark"
- Fallback mechanism is explicit, never silent
- Audit trail exported with Discretion Disclosure Report

**Bias Naming:**
- Framing Sensitivity Test exposes how language shapes reasoning
- Four interpretive schools prevent single-perspective dominance
- Report documents interpretive variance transparently

**Honest Limitations:**
- We don't solve ambiguity; we map it
- AI can't define undefined terms; it can explore interpretive space
- Discretion is irreducible; we make it visible

---

## 🏆 Alignment with IBM watsonx.governance

Inside the Room operationalizes the core use case of watsonx.governance:

| watsonx.governance Goal | Inside the Room Implementation |
|------------------------|-------------------------------|
| Make AI decision discretion visible | Perspectives + ambiguity scoring |
| Create auditable decision trails | Governance Diagnostics + export |
| Document interpretation boundaries | Discretion Disclosure Report |
| Enable regulatory compliance | Structured compliance artifacts |
| Reduce AI deployment risk | Frame sensitivity + fallback transparency |

---

## 📊 Demo Flow (3 minutes)

1. **Framing Test** (0–30s): Show how phrasing shifts Granite reasoning
2. **Perišić Incident** (30–90s): Law text reveal + 4 perspectives + shift metrics
3. **VAR Nested** (90–120s): Meta-insight ("fixing ambiguity just moves it")
4. **Suárez Close** (120–180s): Emotional anchor ("law defines procedure, not justice")

---

## 🔒 Security & Performance

**Token Management:**
- Automated IAM token generation with renewal
- Memory-cached tokens (TTL: 1 hour)
- Zero API keys in frontend code

**Deduplication:**
- In-flight request pooling prevents double submissions
- LRU cache with 10-minute TTL for preset incidents
- Optimistic concurrency control

**Rate Limiting:**
- Vercel built-in protection
- Configurable per-user token limits
- Graceful degradation on quota exhaustion

---

## 🚦 Deployment Checklist

- [ ] IBM Cloud account with watsonx.ai access
- [ ] Project ID + API key configured
- [ ] Vercel account linked to GitHub
- [ ] Environment variables staged in Vercel
- [ ] `npm run build` passes (0 errors)
- [ ] Network test on production (Framing Test latency)
- [ ] Fallback response verified locally
- [ ] Incident data loaded (incidents.json accessible)

---

## 📖 Documentation Map

- **[Project Thesis](docs/01_strategy/)** — H.L.A. Hart, two-decision mechanic, competitive positioning
- **[Frontend System](docs/03_frontend/)** — Glassmorphism tokens, component library, animations
- **[Backend Architecture](docs/04_backend/)** — Vercel functions, Granite integration, error handling
- **[Demo Strategy](docs/05_project_demo/)** — Judge defense playbook, Q&A preparation, pacing notes
- **[Incident Registry](docs/02_product/)** — All 5 incidents fully detailed with reasoning

---

## 🎓 Key References

- **H.L.A. Hart.** *The Concept of Law* (1961). Open-texture doctrine: rules contain terms that resist exhaustive definition.
- **Frederick Schauer.** *Playing by the Rules* (1991). How rule-based systems preserve discretion by design.
- **IBM watsonx.governance** (2024). AI governance platform for decision transparency and auditability.

---

## 🤝 Contributing

This is a hackathon submission (IBM SkillsBuild June 2026). Architecture is frozen; we're not accepting features.

For research or governance inquiry: issues welcome; PRs on architecture: let's discuss.

---

## 📝 License

MIT License — see LICENSE file.

---

## 🙏 Acknowledgements

- IBM Granite team for the structured reasoning capability
- FIFA Laws of the Game as the canonical example
- H.L.A. Hart for the legal philosophy that grounded this entire work
- The 2018, 2010, 2021 World Cup incidents that made the thesis visible

---

## 📞 Questions?

- **GitHub Issues:** https://github.com/acchasujal/InsideTheRoom/issues
- **Live Demo:** https://inside-the-room.vercel.app
- **IBM SkillsBuild Challenge:** https://www.ibm.com/skillsbuild/

---

**Built with ❤️ on Hart's open-texture doctrine + IBM Granite + React + Vercel**
