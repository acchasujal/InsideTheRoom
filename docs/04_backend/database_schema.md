# Database Schema

**Status:** CANONICAL.
**Goal:** Define the data models for the project. While the MVP heavily relies on a static JSON document structure (No-DB), this schema defines both the static structure and the relational future state.

## 1. MVP Schema (Static Document / incidents.json)

For the judging demo, no live database is used. The "schema" is the structure of the JSON bundle acting as the system's datastore.

**Entity: `Incident`**
* `id` (string, primary key)
* `title` (string)
* `summary` (string)
* `video_url` (string)
* `law_involved` (string)
* `disputed_term` (string)
* `reveal_text` (string)
* `decision_1_prompt` (string)
* `decision_2_prompt` (string)
* `reflection_text` (string)
* `perspectives` (Array of Perspective Objects)

**Entity: `Perspective Object`**
* `persona` (string: Fan, Referee, VAR, Rulebook, Player)
* `argument` (string)

---

## 2. Optional Future Schema (Post-Demo Relational DB - PostgreSQL)

If the app scales beyond the demo, use the following relational schema to persist user data and caching.

### 2.1 Entities & Fields

**Table: `incidents`**
* `id` (UUID, Primary Key)
* `title` (VARCHAR 255)
* `summary` (TEXT)
* `media_url` (VARCHAR 255)
* `created_at` (TIMESTAMP)

**Table: `laws`**
* `id` (UUID, Primary Key)
* `law_number` (INTEGER)
* `title` (VARCHAR 255)
* `official_text` (TEXT)
* `undefined_terms` (JSONB) - Array of ambiguous terms (e.g., ["deliberately", "excessive force"])

**Table: `perspectives`**
* `id` (UUID, Primary Key)
* `incident_id` (UUID, Foreign Key to incidents.id)
* `persona_type` (VARCHAR 50)
* `content` (TEXT)

**Table: `reflections`**
* `id` (UUID, Primary Key)
* `incident_id` (UUID, Foreign Key to incidents.id)
* `reflection_text` (TEXT)
* `emotional_objective` (VARCHAR 255)

**Table: `user_decisions` (Telemetry)**
* `id` (UUID, Primary Key)
* `session_id` (VARCHAR 255)
* `incident_id` (UUID, Foreign Key to incidents.id)
* `decision_1_value` (VARCHAR 255)
* `decision_2_value` (VARCHAR 255)
* `changed_mind` (BOOLEAN)
* `created_at` (TIMESTAMP)

**Table: `generated_content` (Layer 2 Cache)**
* `id` (UUID, Primary Key)
* `prompt_hash` (VARCHAR 255, Unique)
* `user_input` (TEXT)
* `granite_response` (JSONB)
* `created_at` (TIMESTAMP)

### 2.2 Relationships
* One-to-Many: `incidents` -> `perspectives`
* One-to-One: `incidents` -> `reflections`
* One-to-Many: `incidents` -> `user_decisions`
* Many-to-Many: `incidents` <-> `laws` (via join table `incident_laws`)

### 2.3 Indexes
* `idx_incidents_title` on `incidents(title)`
* `idx_decisions_incident` on `user_decisions(incident_id)`
* `idx_generated_prompt_hash` on `generated_content(prompt_hash)` (Crucial for fast caching of repeated Layer 2 queries).
