# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**专家能力平台 (Expert Skills Platform)** - A React-based manufacturing skills platform for the lithium battery industry. It provides a skill registry, business ontology visualization, and semantic modeling tools for production-sales coordination.

## Tech Stack

- React 19 + TypeScript 5.8 + Vite 6
- React Router DOM (HashRouter)
- Tailwind CSS for styling
- D3.js + Recharts for data visualization
- Three.js (@react-three/fiber) for 3D visualizations
- Lucide React for icons
- Google GenAI SDK for AI features

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create `.env.local` with:
```
GEMINI_API_KEY=your_gemini_api_key
```

The app works without an API key but uses mock fallbacks for AI features.

## Architecture

### Routing Structure (HashRouter)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard | Main dashboard with metrics |
| `/skills` | SkillsRegistry | Skill listing and management |
| `/skills/:skillId` | SkillDetail | Individual skill details |
| `/skills/new` | SkillRegistration | Register new skills |
| `/ontology` | OntologyGraph | D3.js business process graph |
| `/atoms` | AtomicOntologyModule | Atomic business semantics (L1) |
| `/atoms/scenario` | ScenarioAtomsModule | Scenario-based atom management |
| `/business-semantic` | BusinessSemanticPage | 36 business definitions across 8 categories |

### Domain Model Hierarchy

The platform uses a 4-level ontology structure for the lithium battery manufacturing domain:

1. **L1 - Atomic Ontology** (`AtomicOntology`): Indivisible business factors (temperature, voltage, inventory, etc.)
2. **L2 - Subsystems** (`MolecularOntology`): Functional modules
3. **L3 - Processes** (`MolecularOntology`): Manufacturing processes
4. **L4 - Parameters** (`MolecularOntology`): Specific operational parameters

Key domain concepts:
- **BusinessScenario**: Complete scenario definitions binding L2-L4 structure
- **Skill**: Registered capabilities with input/output schemas, bound to scenarios via `ScenarioBinding`
- **OntologyNode**: Nodes in the business process graph with upstream/downstream relationships

### Key Files

- `types.ts` - All TypeScript interfaces (469 lines, comprehensive domain model)
- `constants.ts` - Mock data for skills, scenarios, ontology nodes, and atomic definitions
- `App.tsx` - Main application with routing and sidebar layout
- `services/geminiService.ts` - Google GenAI integration for task intent parsing

### Path Aliases

The `@` alias maps to the project root:
```typescript
import { Skill } from '@/types';
import Dashboard from '@/components/Dashboard';
```

### Data Flow

1. **Scenario-based skill execution**: Skills are bound to scenarios through `ScenarioBinding` with parameter mappings
2. **Ontology graph**: D3 force-directed graph showing relationships between simulation and data nodes
3. **Simulation**: Multi-step reasoning with AI conversation for production planning scenarios

## Build Output

Production builds are output to `/dist` and include:
- Bundled assets in `dist/assets/`
- Root `index.html` configured for the built assets
