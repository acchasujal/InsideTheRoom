# Inside the Room

Every rulebook — FIFA's, your insurer's, your content policy's — contains words like 
"deliberate" or "reasonable" that are undefined on purpose.

Those undefined words are where discretion lives. They are where lawsuits begin, 
where regulators investigate, and where AI systems fail silently.

Inside the Room is the first tool that finds those words automatically, 
shows you exactly where your own rules stop being rules 
and start being someone's judgment call — 
and documents that boundary as a compliance-grade artifact.

Built on IBM Granite. Demonstrated through football. Designed for any governing text.

---

### The Problem (One Sentence)

FIFA Law 12 says a handball must be "deliberate." 
The law never defines "deliberate." 
That is not a football problem. That is H.L.A. Hart's open-texture problem — 
and it exists in every contract, policy, and regulation ever written.

---

### What We Built

A Granite-powered discretion disclosure instrument.

Not a decision tool. Not a prediction engine. 
A system that finds the undefined term in any governing text, 
generates every legitimate reading of it, 
and produces a structured audit artifact showing exactly where the rules run out.

IBM's watsonx.governance is built to make discretion visible and auditable. 
Inside the Room is that capability, demonstrated live.

---

### The Framing Sensitivity Finding

Same incident. Same rule. Different words. Different Granite output.

If the AI's reading of "reckless" shifts with how the incident is phrased — 
so does every human expert who reads an incident report.

The tool doesn't just map the ambiguity in the rule. 
It maps the ambiguity in description — which is where real discretion risk enters the system.

---

### IBM Alignment

Inside the Room maps directly onto watsonx.governance's core use case: 
making AI decision discretion visible, auditable, and reportable to regulators and stakeholders.

The output is not a recommendation. 
It is a Discretion Disclosure Report — 
a compliance-grade artifact documenting which term is undefined, 
what the defensible readings are, 
and where the rule stops being a rule.

---

### Falsifiable Claim

Submit the same incident in neutral language and in loaded language. 
The perspectives will diverge. 
We show you the divergence on screen, with identical model parameters, 
so the only variable is the phrasing.

That is the discretion risk. That is what this tool surfaces.

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### 1. Install Dependencies

Clone the repository, navigate to the project root directory, and run the following command to install the required packages:

```bash
npm install
```

### 2. Run the Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Once started, the terminal will display the local URL (typically [http://localhost:5173](http://localhost:5173)). Open this address in your web browser to view the application.

### 3. Build for Production

To compile and optimize the application for production deployment, run:

```bash
npm run build
```

This will generate a static production bundle in the `dist/` directory.

### 4. Preview the Production Build

You can preview the production-built site locally to ensure everything works as expected:

```bash
npm run preview
```

---

## 📂 Project Structure & Documentation

Detailed project architecture, strategy guides, design systems, and product requirements are located in the `docs` folder.

To understand the project goals and frontend/backend systems, please refer to:
* 📖 [Documentation Index (docs/README.md)](file:///d:/Projects/InsideTheRoom/docs/README.md)
* 📝 [Frontend UI System (docs/03_frontend/ui_system.md)](file:///d:/Projects/InsideTheRoom/docs/03_frontend/ui_system.md)
* 📝 [Product Requirements (docs/02_product/product_requirements.md)](file:///d:/Projects/InsideTheRoom/docs/02_product/product_requirements.md)
* 📝 [Milestone Plan (docs/06_execution/milestone_plan.md)](file:///d:/Projects/InsideTheRoom/docs/06_execution/milestone_plan.md)
