# API Contracts

**Status:** CANONICAL.
**Goal:** Define every API endpoint required for the MVP and future states. Do not write implementation code.

## 1. Core Endpoints (MVP Layer 2)

### 1.1 Live Perspective Generation
* **Route:** `/api/v1/incidents/generate`
* **Method:** `POST`
* **Purpose:** Triggers the Granite LangFlow pipeline for a novel incident.

**Request Schema:**
```json
{
  "incident_description": "string (max 500 chars)",
  "context": "string (optional)"
}
```

**Validation Rules:**
* `incident_description` must be non-empty and between 10 and 500 characters.
* Rate limiting: 5 requests per minute per IP.

**Response Schema (SSE Stream or JSON):**
```json
{
  "status": "success",
  "data": {
    "retrieved_law": {
      "law_id": "string",
      "text": "string"
    },
    "undefined_term": "string",
    "perspectives": [
      {
        "persona": "enum [Fan, Referee, VAR, Rulebook, Player]",
        "argument": "string",
        "conclusion": "string"
      }
    ],
    "reflection": "string",
    "insight": "string"
  }
}
```

**Error States:**
* `400 Bad Request`: Invalid payload or missing fields.
* `429 Too Many Requests`: Rate limit exceeded.
* `502 Bad Gateway`: LangFlow/watsonx.ai timeout or failure.
* `500 Internal Server Error`: Divergence validator failed (perspectives agreed).

## 2. Optional Future Endpoints (Post-Demo Scaling)

### 2.1 Record User Decision
* **Route:** `/api/v1/decisions`
* **Method:** `POST`
* **Purpose:** Telemetry to track how user decisions change between Decision 1 and Decision 2.

**Request Schema:**
```json
{
  "incident_id": "string",
  "decision_1": "string",
  "decision_2": "string",
  "changed_mind": "boolean"
}
```
**Response Schema:** `201 Created`

### 2.2 Fetch Incident Content
* **Route:** `/api/v1/incidents/{incident_id}`
* **Method:** `GET`
* **Purpose:** To dynamically fetch incidents if migrating away from static JSON.
* **Response Schema:** Returns the full JSON payload for the canonical incident, including setup, perspectives, laws, and reflections.
* **Error States:** `404 Not Found`.

### 2.3 Fetch FIFA Laws
* **Route:** `/api/v1/laws/{law_id}`
* **Method:** `GET`
* **Purpose:** Standalone endpoint to retrieve official rules.
* **Response Schema:** Returns exact law text.
* **Error States:** `404 Not Found`.

### 2.4 Fetch Reflections
* **Route:** `/api/v1/reflections/{incident_id}`
* **Method:** `GET`
* **Purpose:** Retrieve the predefined reflection payload for an incident.
* **Response Schema:** Returns the reflection summary and emotional objective.
