# Inside the Room

Every rulebook — FIFA's, your insurer's, your content policy's — contains words like "deliberate" or "reasonable" that are undefined on purpose. 

Those undefined words are where discretion lives. They are where lawsuits begin, where regulators investigate, and where AI decision systems fail silently.

**Inside the Room** is the first tool that finds those words automatically, shows you exactly where your rules stop being rules and start being someone's judgment call, and documents that boundary as a compliance-grade artifact.

Built on **IBM Granite**, demonstrated through football, and designed for any governing text.

---

## 🧭 The Core Problem & Our Moat

### The Core Ambiguity Problem
FIFA Law 12 says a handball must be *"deliberately played"*. The law never defines *"deliberately"*. This isn't a football problem; it is H.L.A. Hart's **open-texture problem**, which exists in every contract, policy, and regulation ever written. 

### What We Built: A Granite-Powered Discretion Disclosure Instrument
Not a decision-maker. Not a prediction engine. A governance tool that:
1. Finds the undefined term in any governing text.
2. Generates every legitimate reading of it.
3. Produces a structured audit artifact showing exactly where the rules run out.

Inside the Room aligns directly with the core use case of **IBM watsonx.governance**: making AI decision discretion visible, auditable, and reportable to regulators and stakeholders.

---

## 🛠️ Technology Stack & Architecture

- **Frontend Core:** HTML5, CSS3, React (v19)
- **State Management & Routing:** React Router (v7)
- **Serverless & Proxy Gateway:** Vercel serverless functions (`/api/generate`, `/api/health`, `/api/self-test`)
- **Model Orchestration:** Parallel live requests querying IBM watsonx.ai model `ibm/granite-4-h-small` (or configured override model)
- **Zero-Trust Token Management:** Automated local IAM OAuth token generation and memory caching

---

## 🚀 Local Installation & Quick Start

Follow these steps to set up and run the application locally:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (LTS version 18+ recommended).

### 1. Install Dependencies
Clone the repository, navigate to the project directory, and install the npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
VITE_WATSONX_MODEL_ID=ibm/granite-4-h-small
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 4. Build for Production
To build a static production bundle optimized for Vercel/CDN deployment:
```bash
npm run build
```

---

## 🔍 System Verification & Audit Compliance

Our pipeline is strictly verified and production-ready:
- **Build Status:** 0 Build Errors, 0 TypeScript Errors, 0 Lint Warnings.
- **Hook Rules & Type Safety:** 100% compliant with React hook standards and type safety.
- **Deduplication:** In-flight request deduplication prevents double-click concurrency leaks.
- **Falsifiable Finding (Framing Sensitivity Test):** Submit an incident in neutral vs. loaded language. The governance heatmap will dynamically map the verdict shift under identical model parameters, highlighting discretion risk.

---

## 📂 Project Documentation Map

Detailed strategies, requirements, and guides are located in the `/docs` folder:
* 📖 [Documentation Index](file:///d:/Projects/InsideTheRoom/docs/README.md) — Canonical onboarding index.
* 📝 [Project Thesis](file:///d:/Projects/InsideTheRoom/docs/01_strategy/project_thesis.md) — Two-Decision mechanic and strategy.
* 📝 [Frontend UI System](file:///d:/Projects/InsideTheRoom/docs/03_frontend/ui_system.md) — Glassmorphism and tokens.
* 📝 [Backend Architecture](file:///d:/Projects/InsideTheRoom/docs/04_backend/backend_architecture.md) — Subsystems and routing.
* 📝 [Judge Defense Playbook](file:///d:/Projects/InsideTheRoom/docs/05_project_demo/judge_defense_playbook.md) — Preempted Q&A guidelines.
