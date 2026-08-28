# Chronarch Authority: 3D Procedural Bureaucratic Time Game

An original 3D game built with JavaScript (ES Modules), Three.js, and Vite. The player assumes the role of a Temporal Variant inside the vast, infinite facility of the **Chronarch Authority**, navigating dynamic alert levels, procedural room structures, multi-state NPC AI, and temporal choices.

---

## Architectural Systems Breakdown

1. **Procedural Modular Generation System (`src/procedural/RoomGenerator.js`)**
   - Renders sequence-chained rooms (hallways, checkpoints, offices, archives) using bounding volumes and automatic light/fixture placement.
   - Dynamically registers mesh geometries into an AABB collision array for physics evaluation.

2. **Temporal Deviation & Authority Alert Engine (`src/world/TemporalDeviationSystem.js`)**
   - Continuously monitors unlawful actions (stealing files, ignoring orders, carrying illegal technology).
   - Dynamically scales alert states across 7 tiers (`LEVEL 0` through `LEVEL 6: TEMPORAL EMERGENCY`).

3. **Stealth & Guard AI State Machine (`src/ai/GuardAI.js`)**
   - Operates a field-of-view cone raycasting model with variable vision distance based on player movement states (Standing vs. Crouching).
   - Full finite state machine flow: `PATROL` -> `SUSPICIOUS` -> `CHASE` -> `SEARCHING`.

4. **Interactive Branching Narrative & Adjudication System (`src/dialogue/`)**
   - Data-driven narrative tree system supporting interactive player choices, dialogue flags, mission completions, and courtroom evidentiary verdicts.

---

## Installation & Local Development Instructions

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm (version 9.0.0 or higher)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/chronarch-authority.git](https://github.com/your-username/chronarch-authority.git)
   cd chronarch-authority
