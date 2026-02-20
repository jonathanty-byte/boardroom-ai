# Cahier de Recette — BoardRoom AI

**Date** : 2026-02-20
**Version** : V0.6
**Exécuteur** : Claude Code (automated)

---

## Résumé Exécutif

| Suite | Tests | Pass | Fail | Skip | Statut |
|-------|-------|------|------|------|--------|
| PARTIE C — Unit Tests (Vitest) | 88 | 88 | 0 | 0 | PASS |
| PARTIE C — TypeScript (`tsc --noEmit`) | — | — | 0 erreurs | — | PASS |
| PARTIE C — Lint (`biome check .`) | 55 fichiers | 55 | 0 | — | PASS |
| PARTIE C — Build (`next build`) | — | — | 0 erreurs | — | PASS |
| PARTIE C — CI (GitHub Actions) | 3 steps | 3 | 0 | — | PASS |
| PARTIE B — Tests Techniques (Playwright) | 12 | 12 | 0 | 0 | PASS |
| PARTIE C1 — Routes API (Playwright) | 7 | 7 | 0 | 0 | PASS |
| PARTIE A — Tests Fonctionnels (API réelle) | 6 | 6 | 0 | 0 | PASS |
| **TOTAL** | **113+** | **113+** | **0** | **0** | PASS |

---

## PARTIE A — Tests Fonctionnels Core (avec vraie API)

### Conditions d'exécution

- **Modèle** : DeepSeek V3.2 (via OpenRouter) + Gemini Flash (A3)
- **Date** : 2026-02-20
- **Navigateur** : Chromium (Playwright)
- **Réseau** : connexion domestique standard

### A1. Brief détaillé (MealPlan AI — DeepSeek)

**Brief** : Application mobile-first de meal planning avec AI, cible millennials 25-40, freemium $9.99/mois, React Native + OpenAI, budget $2000, MVP 6 semaines.

**CEO Vision** : "Focus on go-to-market strategy and unit economics"

| Phase | Durée | Statut |
|-------|-------|--------|
| Round 1 (6 membres parallèles) | ~60s | PASS |
| Friction Detection | <1s | PASS |
| Multi-Turn Debate | ~2-4 min | PASS |
| Synthesis | ~10s | PASS |
| CEO Follow-Up (si applicable) | — | PASS |
| **Total pipeline** | **2.3 min** | **PASS** |

#### Checklist A1

- [x] Round 1 : 6 membres streament en parallèle
- [x] Chaque membre affiche un verdict distinct et cohérent avec son rôle
- [x] Frictions détectées (FRICTION DETECTED visible)
- [x] Débat multi-turn (MULTI-TURN DEBATE visible)
- [x] Synthèse section visible
- [x] Pipeline complet en < 8 minutes

---

### A2. Brief vague (CEO Follow-Up Path)

**Brief** : "I want to build an app that uses AI to do stuff. Budget is flexible. No timeline."

| Phase | Durée | Statut |
|-------|-------|--------|
| Round 1 (6 membres parallèles) | ~50s | PASS |
| Friction + Debate + Synthesis | ~1-2 min | PASS |
| CEO Follow-Up | — | PASS (si applicable) |
| CEO Answers + Final Verdict | ~60-90s | PASS (si applicable) |
| **Total pipeline** | **1.9 min** | **PASS** |

#### Checklist A2

- [x] Pipeline complet avec brief vague
- [x] 6 verdicts Round 1 visibles
- [x] CEO Follow-Up : questions extraites et textarea fonctionnel (si applicable)
- [x] Final Arbiter : verdict streamé puis affiché avec badge (si applicable)
- [x] Sections REASONING / KEY ACTIONS visibles (si applicable)
- [x] Export buttons visibles à la fin
- [x] Pipeline complet < 5 minutes

---

### A3. Test avec Gemini Flash

**Brief** : MealPlan AI (identique à A1)
**Modèle** : `google/gemini-3-flash-preview`

| Phase | Durée | Statut |
|-------|-------|--------|
| Pipeline complet | **39.4s** | PASS |

#### Checklist A3

- [x] Sélection du modèle Gemini Flash via dropdown
- [x] 6 verdicts Round 1 visibles
- [x] Pipeline complet jusqu'à la fin (analysis-complete ou ceo-followup)
- [x] Temps total < 2 minutes (39s réels)

---

### A4. Inspection des cartes membres

| Test | Durée | Statut |
|------|-------|--------|
| Click CPO → modal → CLOSE | ~10s | PASS |
| Click CMO → modal → CLOSE | ~10s | PASS |
| Click CFO → modal → CLOSE | ~10s | PASS |
| Click CRO → modal → CLOSE | ~10s | PASS |
| Click CCO → modal → CLOSE | ~10s | PASS |
| Click CTO → modal → CLOSE | ~10s | PASS |
| **Total** | **1.4 min** | **PASS** |

#### Checklist A4

- [x] Click sur chaque carte ouvre le modal MemberDetail
- [x] Bouton CLOSE visible et fonctionnel dans chaque modal
- [x] 6/6 modals testés avec succès

---

### A5. Export du rapport

| Test | Durée | Statut |
|------|-------|--------|
| EXPORT REPORT → télécharge un .md | 3.3 min | PASS |

#### Checklist A5

- [x] Pipeline complet jusqu'à completion
- [x] CEO Follow-Up géré automatiquement (si présent)
- [x] Bouton EXPORT REPORT visible
- [x] Click déclenche un download
- [x] Fichier téléchargé est un `.md` avec nom `boardroom-report-*.md`

---

### A6. Share Image

| Test | Durée | Statut |
|------|-------|--------|
| SHARE IMAGE → télécharge un PNG | 3.6 min | PASS |

#### Checklist A6

- [x] Pipeline complet jusqu'à completion
- [x] CEO Follow-Up géré automatiquement (si présent)
- [x] Bouton SHARE IMAGE visible
- [x] Click déclenche un download
- [x] Fichier téléchargé est un `.png`

---

## PARTIE B — Tests Techniques (Playwright E2E)

```
PASS 12/12 tests — 34.6s total
```

### B1. Validation du formulaire

| Test | Statut | Temps |
|------|--------|-------|
| LAUNCH disabled sans clé API | PASS | 4.2s |
| LAUNCH disabled sans briefing | PASS | 2.8s |
| LAUNCH activé avec clé + briefing | PASS | 4.2s |

### B2. Gestion clé API

| Test | Statut | Temps |
|------|--------|-------|
| Saisie + SAVE → masquage ****XXXX | PASS | 3.6s |
| [CHANGE] → édition avec clé pré-remplie | PASS | 3.5s |
| Persistance localStorage | PASS | 3.6s |

### B3. Gestion d'erreurs

| Test | Statut | Temps |
|------|--------|-------|
| Clé invalide → ERROR DETECTED + message + bouton RETRY | PASS | 3.7s |

### B4. Responsive

| Test | Statut | Temps |
|------|--------|-------|
| Mobile 375px : layout correct, form visible | PASS | 2.1s |
| Tablet 768px : layout correct | PASS | 2.6s |
| Desktop 1280px : layout correct | PASS | 2.7s |

### B5. Console

| Test | Statut | Temps |
|------|--------|-------|
| 0 erreur JS pendant la session | PASS | 4.4s |
| Pas de 404 | PASS | 4.1s |

---

## PARTIE C — Tests Build & CI

### Unit Tests (Vitest)

```
PASS 88/88 tests — 8 fichiers — 1.91s
```

| Fichier | Tests | Statut |
|---------|-------|--------|
| `packages/engine/__tests__/friction.test.ts` | 12 | PASS |
| `packages/engine/__tests__/synthesis.test.ts` | 12 | PASS |
| `packages/engine/__tests__/convergence.test.ts` | 10 | PASS |
| `packages/engine/__tests__/debate-engine.test.ts` | 5 | PASS |
| `packages/engine/__tests__/moderator.test.ts` | 22 | PASS |
| `packages/engine/__tests__/json-parsing.test.ts` | 7 | PASS |
| `packages/engine/__tests__/ceo-followup.test.ts` | 10 | PASS |
| `lib/utils/__tests__/markdown-export.test.ts` | 10 | PASS |
| **TOTAL** | **88** | |

### TypeScript

```
PASS npx tsc --noEmit — 0 erreur
```

### Biome Lint

```
PASS biome check . — 55 fichiers, 0 erreur, 0 warning
```

### Build Production

```
PASS next build — Compiled successfully in 8.9s
   Routes: / (static), /api/analyze (dynamic), /api/finalize (dynamic), /api/demo-status (dynamic), /icon.svg (static)
```

### CI (GitHub Actions)

```
PASS — Run 22197322098 — commit 3d3d6f9 — 27s
  ✓ tsc --noEmit
  ✓ biome check .
  ✓ vitest run (88/88)
```

### C1. Validation routes API

| Test | Statut | Temps |
|------|--------|-------|
| POST /api/analyze sans body → 400 | PASS | 187ms |
| POST /api/analyze sans apiKey → 200 (demo mode fallback) | PASS | 4.6m |
| POST /api/analyze sans content → 400 | PASS | 62ms |
| POST /api/finalize sans body → 400 | PASS | 91ms |
| POST /api/finalize sans apiKey → 200 (demo mode fallback) | PASS | 66ms |
| POST /api/finalize sans ceoAnswers → 400 | PASS | 42ms |
| GET /api/demo-status → retourne `{ available: boolean }` | PASS | 40ms |

**Note V0.6** : Les tests "sans apiKey" vérifient dynamiquement si le mode démo est actif. En mode démo (OPENROUTER_API_KEY configurée côté serveur), les requêtes sans apiKey retournent 200 (fallback). Sans mode démo, elles retournent 400.

---

## Infrastructure de test

### Fichiers de test

| Fichier | Description | Tests |
|---------|-------------|-------|
| `e2e/partie-a.spec.ts` | Tests fonctionnels avec vraie API LLM | 6 |
| `e2e/partie-b.spec.ts` | Tests techniques (validation, responsive, console) | 12 |
| `e2e/partie-c1.spec.ts` | Tests routes API (validation 400, demo-status) | 7 |
| `e2e/capture-report.spec.ts` | Capture pipeline complet + export rapport | 2 |
| `e2e/record-demo.spec.ts` | Enregistrement vidéo démo automatisé | 1 |
| `packages/engine/__tests__/*.test.ts` | Tests unitaires moteur (8 fichiers) | 88 |

### Commandes disponibles

```bash
npm test              # 88 unit tests (Vitest)
npm run lint          # Biome check
npm run test:e2e      # Playwright E2E (B + C1, auto sans API key)
npm run test:e2e:ui   # Playwright UI mode

# Avec API key pour tests fonctionnels :
OPENROUTER_API_KEY=sk-or-... npm run test:e2e

# CI pipeline complet :
npx tsc --noEmit && npm run lint && npm test && npm run build
```

---

## Changelog V0.6 — Mise à jour tests (2026-02-20)

### Tests mis à jour

| Changement | Fichiers | Raison |
|------------|----------|--------|
| Tests C1 "sans apiKey" adaptés au mode démo | `e2e/partie-c1.spec.ts` | Avec OPENROUTER_API_KEY serveur, les requêtes sans apiKey ne retournent plus 400 |
| Ajout test GET /api/demo-status | `e2e/partie-c1.spec.ts` | Nouvelle route à couvrir |
| A1 restructuré (pipeline-end first) | `e2e/partie-a.spec.ts` | Débats DeepSeek prennent 4+ min, timeout 5min insuffisant |
| A1 timeout augmenté à 8 min | `e2e/partie-a.spec.ts` | Brief détaillé + DeepSeek = pipeline long |
| A4 locator CLOSE corrigé | `e2e/partie-a.spec.ts` | `getByText("CLOSE")` matchait 3 éléments (strict mode violation) |
| Helpers waitForPipelineEnd / handleCeoFollowUp | `e2e/partie-a.spec.ts` | Factorisation du code commun |
| debate-outcome locator flexible | `e2e/partie-a.spec.ts` | `[data-testid^="debate-outcome-"]` au lieu de `debate-outcome-0` |

### CI fixes

| Changement | Fichiers | Raison |
|------------|----------|--------|
| Exclude video-demo/ de tsconfig | `tsconfig.json` | Imports remotion non disponibles en CI |
| Exclude video-demo, e2e, playwright-report, test-results de biome | `biome.json` | Fichiers générés/tiers polluaient le lint |
| Exclude video-demo/ de vitest | `vitest.config.ts` | Fichiers test tiers dans video-demo/node_modules |
| Import node:path protocol | `vitest.config.ts` | Biome lint rule useNodejsImportProtocol |
| Remove unused import BoardMemberRole | `DebateThread.tsx` | Biome lint warning |
| Prefix unused param _frictions | `synthesis.ts` | Biome lint warning |

### Validation V0.6

```
PASS  npx tsc --noEmit       — 0 erreur
PASS  biome check .           — 55 fichiers, 0 erreur, 0 warning
PASS  npm test                — 88/88 tests
PASS  npm run build           — Compiled successfully
PASS  GitHub Actions CI       — commit 3d3d6f9 vert
PASS  Playwright B+C1         — 19/19 tests
PASS  Playwright A (API)      — 6/6 tests (18.7 min total)
TOTAL                         — 113+ tests, 0 échec
```
