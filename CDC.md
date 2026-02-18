# Cahier des Charges — BoardRoom AI

**Plateforme d'Analyse Strategique Multi-Agents IA**

- **Date :** 18 fevrier 2026
- **Version :** 0.2.0
- **Auteur :** Jonathan Ty
- **Repo :** github.com/jonathanty-byte/boardroom-ai
- **Production :** boardroom-ai.vercel.app

---

## 1. Vision produit

BoardRoom AI simule un comite executif compose de 6 personnalites IA qui analysent, debattent et jugent un projet ou une decision business. Chaque membre a un role C-level, une personnalite distincte (theme Dragon Ball Z) et un cadre d'analyse propre.

**Proposition de valeur :** Transformer une decision solitaire en un stress-test multi-perspective en moins de 2 minutes, pour une fraction du cout d'un vrai conseil consultatif.

**Positionnement :** Outil de decision-making augmente par IA, accessible en BYOK (Bring Your Own Key) via OpenRouter.

---

## 2. Architecture technique

```
Navigateur (React 19)
    |
    |  POST /api/analyze { content, ceoVision, apiKey, model }
    v
Next.js Edge Runtime (Vercel)
    |
    |  ReadableStream + SSE (Server-Sent Events)
    v
OpenRouter API (openrouter.ai/api/v1)
    |
    |  OpenAI SDK compatible — deepseek/deepseek-v3.2 par defaut
    v
6 appels LLM paralleles (Round 1)
    |
    v
Detection de frictions (code, pas de LLM)
    |
    v
Moderateur IA (LLM) — identifie les axes de tension
    |
    v
Debat multi-tour (3-5 tours par friction, LLM)
    |  Convergence automatique ou max tours
    v
Synthese (code)
    |
    v
CEO Follow-Up Questions (heuristique, pas de LLM)
    |  Si debates non resolus → questions au CEO
    v
[Optionnel] Final Arbiter (LLM) — verdict definitif apres reponses CEO
    |
    v
Rapport BoardRoom Report final
```

### Stack

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime API | Edge Runtime (Vercel) | — |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | 4.1.18 |
| Client LLM | openai (SDK) | 6.22.0 |
| Provider LLM | OpenRouter | — |
| Modele par defaut | DeepSeek V3.2 | — |
| Linting | Biome | 2.4.2 |
| Tests | Vitest | 4.0.18 |
| Hebergement | Vercel | — |
| Langage | TypeScript | 5.9.3 |

### Monorepo

Le projet utilise des npm workspaces :
- **`packages/engine`** (`@boardroom/engine`) : moteur d'analyse pur TypeScript, zero dependance framework
- **Racine** : app Next.js qui consomme le moteur via SSE

### Modeles disponibles

| Modele | ID OpenRouter | Input/1M | Output/1M | Usage |
|--------|--------------|----------|-----------|-------|
| DeepSeek V3.2 | `deepseek/deepseek-v3.2` | $0.26 | $0.38 | Defaut — excellent rapport qualite/prix |
| Claude Sonnet 4.6 | `anthropic/claude-sonnet-4.6` | $3.00 | $15.00 | Premium — meilleur raisonnement |
| Claude Opus 4.5 | `anthropic/claude-opus-4.5` | $5.00 | $25.00 | Ultra — qualite maximale |
| Gemini 3 Flash | `google/gemini-3-flash-preview` | ~$0.10 | ~$0.40 | Budget — tres rapide |

---

## 3. Les 6 membres du BoardRoom AI

| Role | Persona | Titre | Temperature | Specialite |
|------|---------|-------|-------------|------------|
| CPO | Vegeta | Chief Product Officer | 0.8 | Scope MVP, validation utilisateur, metriques produit |
| CMO | Bulma | Chief Marketing Officer | 0.8 | Positionnement, acquisition, messaging, pricing |
| CFO | Piccolo | Chief Financial Officer | 0.6 | Unit economics, projections, couts caches, viabilite |
| CRO | Whis | Chief Research Officer | 0.7 | Benchmark concurrence, hypotheses, frameworks academiques |
| CCO | Gohan | Chief Creative Officer | 0.8 | UX, brand identity, premiere impression, micro-copy |
| CTO | Trunks | Chief Technology Officer | 0.7 | Faisabilite, stack, estimation heures, dette technique |

### Verdicts par role

- **CPO/CMO :** `GO` | `GO_WITH_CHANGES` | `RETHINK`
- **CFO :** `VIABLE` | `VIABLE_WITH_ADJUSTMENTS` | `NOT_VIABLE`
- **CRO :** `VALIDATED` | `NEEDS_RESEARCH` | `HYPOTHESIS_ONLY`
- **CCO :** `SHIP_IT` | `NEEDS_DESIGN_DIRECTION` | `WILL_FEEL_GENERIC`
- **CTO :** `FEASIBLE` | `FEASIBLE_WITH_CUTS` | `UNREALISTIC`

### Structure de sortie Round 1

Chaque membre produit :
- **analysis** : Analyse detaillee (minimum 15 lignes)
- **challenges** : Questions pour le CEO
- **verdict** : Verdict specifique au role
- **verdictDetails** : Metriques specifiques (pointFort, risqueCritique, recommandationConcrete, etc.)

---

## 4. Pipeline d'analyse (V0.2)

### Phase 1 — Round 1 : Analyses independantes

- 6 appels LLM **en parallele** via `Promise.all`
- Chaque membre recoit le meme briefing + CEO vision
- Streaming en temps reel (SSE `member_chunk` events)
- Parsing JSON a la fin de chaque stream
- **Duree typique :** 15-30 secondes

### Phase 2 — Detection de frictions

- **Algorithme purement code** (pas de LLM)
- Scoring de sentiment par verdict :
  - Positif (+1) : GO, VIABLE, VALIDATED, SHIP_IT, FEASIBLE
  - Neutre (0) : GO_WITH_CHANGES, VIABLE_WITH_ADJUSTMENTS, FEASIBLE_WITH_CUTS
  - Prudent (-0.5) : NEEDS_RESEARCH, NEEDS_DESIGN_DIRECTION
  - Negatif (-1) : RETHINK, NOT_VIABLE, HYPOTHESIS_ONLY, WILL_FEEL_GENERIC, UNREALISTIC
- Comparaison par paires (15 paires pour 6 membres)
- **Friction declenchee** si ecart de sentiment >= 1.5
- **Fallback** : si aucune friction naturelle, force un debat entre les 2 membres les plus divergents
- Supporte les frictions multi-membres (union-find grouping)

### Phase 3 — Moderateur IA + Debat multi-tour

**Le moderateur** est un 7eme appel LLM :
- Lit toutes les analyses Round 1
- Identifie les axes de tension (pas juste les verdicts, mais les arguments sous-jacents)
- Formule des questions precises pour chaque friction
- Decide qui parle a chaque tour
- Detecte la convergence ou declare l'impasse

**Le debat multi-tour** (par friction) :
- Max 5 tours par friction
- Types de tours : `CHALLENGE`, `RESPONSE`, `COUNTER`, `CONCESSION`, `INTERVENTION`
- Position shifts : `UNCHANGED`, `SOFTENED`, `REVERSED`
- Citation directe des arguments adverses (`quotedFrom`)
- Arret : convergence detectee OU max tours atteint

**Outcomes possibles :**
- `CONVERGED` : consensus atteint
- `MAX_TURNS_REACHED` : pas de consensus apres 5 tours
- `IMPASSE` : positions maintenues, aucun mouvement

### Phase 4 — Synthese

- **Consensus** : Recommandations partagees (extraites des Round 1)
- **Compromis** : Frictions resolues par convergence dans le debat
- **Impasses** : Frictions non resolues (le CEO doit decider)
- **Verdict collectif** : Moyenne des sentiments → `GO` | `GO_WITH_CHANGES` | `RETHINK`

### Phase 5 — CEO Follow-Up Questions (conditionnel)

Active uniquement si des debats finissent en IMPASSE ou MAX_TURNS_REACHED :
- **Extraction heuristique** (pas de LLM) des challenges Round 1 des membres impliques
- 1 question contextuelle par debat non resolu basee sur l'outcomeSummary
- Deduplication par prefixe (20 chars)
- Max 5 questions, priorisees : IMPASSE > MAX_TURNS_REACHED
- Retourne `[]` si tous les debats convergent → pas de questions

### Phase 6 — Final Arbiter (conditionnel)

Quand le CEO repond aux questions :
- Un seul appel LLM "Final Arbiter" avec tout le contexte :
  - Analyses Round 1 completes
  - Historique des debats
  - Reponses du CEO
- System prompt pragmatique : "Your job is to DECIDE. No more debate."
- Produit : verdict collectif, reasoning, key actions, risks, next steps
- Streaming en temps reel

**Important :** Le Final Arbiter ne relance PAS le pipeline. C'est un verdict definitif qui tranche.

### Cout estime par analyse

| Modele | Cout Round 1+Debat | Cout avec Final Arbiter |
|--------|-------------------|------------------------|
| DeepSeek V3.2 | ~$0.03-0.05 | ~$0.05-0.07 |
| Claude Sonnet 4.6 | ~$0.75-1.20 | ~$1.00-1.50 |
| Claude Opus 4.5 | ~$1.20-1.80 | ~$1.50-2.30 |

---

## 5. Interface utilisateur

### Theme visuel

- **Style :** Pixel art RPG retro (NES/SNES)
- **Fonts :** Press Start 2P (titres), VT323 (contenu terminal)
- **Palette :** Fond sombre (#0a0a12), bordures pixel (#4a4a8a), accents DBZ
- **Effets :** Scanlines CRT, ki-charge glow, verdict flash, friction sparks, etoiles en fond

### Composants principaux

| Composant | Fichier | Description |
|-----------|---------|-------------|
| Page principale | `app/page.tsx` | Hero, form, board, CEO follow-up, final verdict, rapport, footer |
| Formulaire | `AnalysisForm.tsx` | Textarea briefing + CEO vision + select modele |
| Cle API | `ApiKeyInput.tsx` | BYOK OpenRouter avec localStorage |
| Salle du board | `BoardRoom.tsx` | Grille 2x3 des membres + phase tracker + frictions + debats + synthese |
| Carte membre | `MemberCard.tsx` | Avatar SVG + streaming + verdict + detail modal |
| Detail membre | `MemberDetail.tsx` | Analyse complete, challenges, verdict details |
| Badge verdict | `VerdictBadge.tsx` | Badge colore avec glow (vert/orange/rouge) |
| Texte streaming | `StreamingText.tsx` | Texte en temps reel avec curseur clignotant |
| Thread debat | `DebateThread.tsx` | UI conversation style chat pour debats multi-tour |
| CEO Follow-Up | `CEOFollowUp.tsx` | Questions du board + reponses CEO + bouton "GET FINAL VERDICT" |
| Final Verdict | `FinalVerdict.tsx` | Verdict final avec reasoning, actions, risques, next steps |
| Export | `ExportButton.tsx` | Telecharger rapport BoardRoom Report en Markdown |
| Share Image | `ShareImage.tsx` | Generer image de partage du rapport |
| Bouton retro | `RetroButton.tsx` | Bouton gradient or/orange avec effet 3D |

### Avatars

6 avatars SVG pixel art dans `public/avatars/` :
- vegeta.svg (CPO — aura orange)
- bulma.svg (CMO — aura bleue)
- piccolo.svg (CFO — aura verte)
- whis.svg (CRO — aura violette)
- gohan.svg (CCO — aura rouge)
- trunks.svg (CTO — aura cyan)

### Protocole SSE

**Endpoint `/api/analyze`** (15 types d'evenements) :

```
state_change          → Met a jour la phase (round1, frictions, round2, synthesis)
member_chunk          → Texte streaming par membre (Round 1)
member_complete       → Resultat parse d'un membre (Round 1)
frictions_detected    → Frictions identifiees
moderator_action      → Action du moderateur (question posee)
debate_turn_start     → Debut d'un tour de debat (speaker annonce)
debate_turn_chunk     → Texte streaming du debatteur
debate_turn_complete  → Tour de debat complet (avec turn data)
debate_resolved       → Debat termine (outcome + summary)
debate_chunk          → [Legacy] Texte streaming Round 2
debate_complete       → [Legacy] Resultat Round 2
synthesis_complete    → Synthese finale
ceo_followup          → Questions CEO extraites (si debats non resolus)
analysis_complete     → Rapport BoardRoom Report complet
error                 → Message d'erreur
```

**Endpoint `/api/finalize`** (3 types d'evenements) :

```
final_verdict_start    → Debut du streaming du verdict final
final_verdict_chunk    → Texte streaming du Final Arbiter
final_verdict_complete → Verdict final parse (CEOFinalVerdict)
```

### Export BoardRoom Report

Le rapport final est exportable en Markdown avec la structure :
- En-tete (nom du projet, date, CEO vision)
- Verdicts individuels (resume par membre)
- Verdict collectif
- Analyses detaillees Round 1 (6 sections)
- Points de friction
- Debats multi-tour (V0.2) ou Round 2 legacy
- Synthese (consensus, compromis, impasses)
- CEO Follow-Up Questions + CEO Answers (si applicable)
- Final Verdict + Key Actions + Risks + Next Steps (si applicable)

---

## 6. Workflow utilisateur

### Cas 1 — Brief detaille (pas de questions)

1. CEO soumet briefing + vision + modele
2. Round 1 : 6 analyses en parallele (streaming)
3. Frictions detectees
4. Debats multi-tour (streaming)
5. Synthese generee
6. → Tous les debats convergent → **pas de questions CEO**
7. "ANALYSIS COMPLETE" + boutons Export/Share

### Cas 2 — Brief vague (questions CEO + Final Verdict)

1-5. Identique au Cas 1
6. Des debats finissent en IMPASSE/MAX_TURNS_REACHED
7. Questions extractees, affichees au CEO
8. CEO repond dans les textareas
9. Clique "GET FINAL VERDICT"
10. Final Arbiter streame le verdict definitif
11. "ANALYSIS COMPLETE" + boutons Export/Share (rapport inclut Q&A + verdict)

---

## 7. Roadmap

### V0.1 — MVP fonctionnel ✅

- [x] 6 agents IA independants avec streaming
- [x] Detection de frictions par scoring de sentiment
- [x] Round 2 reactions (1 tour)
- [x] Synthese automatique
- [x] Interface RPG pixel art (theme DBZ)
- [x] Avatars SVG pixel art
- [x] Export BoardRoom Report Markdown
- [x] BYOK OpenRouter
- [x] Deploy Vercel

### V0.2 — Moteur de debat + CEO Loop ✅

- [x] Agent moderateur LLM
- [x] Debat multi-tour (3-5 tours par friction)
- [x] Historique de conversation cumule
- [x] Detection de convergence automatique
- [x] UI thread de conversation (DebateThread)
- [x] Frictions multi-membres (union-find)
- [x] CEO Follow-Up Questions (extraction heuristique)
- [x] Final Arbiter (verdict definitif apres reponses CEO)
- [x] Export enrichi (Q&A + verdict final)
- [x] Role normalization + CTO prompt tuning

### V0.3 — Polish et viralite

- [ ] OG image dynamique (verdict + board members)
- [ ] Partage de rapport par lien unique
- [ ] Animations d'entree des personnages
- [ ] Son retro 8-bit (optionnel, mutable)
- [ ] Mode sombre/clair
- [ ] Responsive mobile
- [ ] Prompt tuning iteratif (moderateur + membres)

### V1.0 — Produit

- [ ] Historique des analyses (localStorage)
- [ ] Templates de briefing (pitch deck, feature spec, business case)
- [ ] Personnalisation des membres du board (swap personas)
- [ ] API publique pour integration
- [ ] Landing page avec demo interactive

---

## 8. Structure du projet

```
boardroom-ai/
├── app/
│   ├── layout.tsx                  # Fonts (Press Start 2P, VT323), metadata
│   ├── page.tsx                    # Page principale (orchestration UI complete)
│   ├── globals.css                 # Theme RPG pixel art complet
│   └── api/
│       ├── analyze/route.ts        # SSE endpoint principal (Edge Runtime)
│       └── finalize/route.ts       # SSE endpoint Final Arbiter (Edge Runtime)
├── components/
│   ├── board/
│   │   ├── BoardRoom.tsx           # Grille 2x3 + phase tracker + frictions + debats + synthese
│   │   ├── MemberCard.tsx          # Carte personnage avec avatar, streaming, verdict
│   │   ├── MemberDetail.tsx        # Modal analyse complete
│   │   ├── VerdictBadge.tsx        # Badge verdict colore avec glow
│   │   ├── DebateThread.tsx        # Thread de debat style chat (V0.2)
│   │   ├── CEOFollowUp.tsx         # Questions board → CEO + reponses + bouton verdict
│   │   └── FinalVerdict.tsx        # Verdict final (streaming + complete)
│   ├── analysis/
│   │   ├── AnalysisForm.tsx        # Formulaire briefing + CEO vision + modele
│   │   └── StreamingText.tsx       # Texte temps reel avec curseur
│   ├── report/
│   │   ├── ExportButton.tsx        # Telecharger BoardRoom Report.md
│   │   └── ShareImage.tsx          # Generer image de partage
│   ├── settings/
│   │   └── ApiKeyInput.tsx         # BYOK OpenRouter + localStorage
│   └── ui/
│       └── RetroButton.tsx         # Bouton RPG gradient
├── lib/
│   ├── hooks/
│   │   ├── useBoardroomAnalysis.ts # Hook SSE principal (analyze + finalize)
│   │   ├── useAnalysisState.ts     # Reducer etat analyse (15+ actions SSE)
│   │   └── useApiKey.ts            # Hook localStorage cle API
│   └── utils/
│       ├── constants.ts            # Modeles, couleurs verdicts
│       └── markdown-export.ts      # Generateur rapport BoardRoom Report
├── packages/
│   └── engine/                     # @boardroom/engine — moteur pur TypeScript
│       ├── src/
│       │   ├── types.ts            # Tous les types (Board, Debate, CEO, SSE, Report)
│       │   ├── board-members.ts    # 6 configs + system prompts detailles
│       │   ├── runner-streaming.ts # Client OpenRouter streaming + JSON parsing + Final Arbiter
│       │   ├── engine-streaming.ts # Orchestrateur pipeline complet (Round 1 → CEO Follow-Up)
│       │   ├── friction.ts         # Detection frictions (sentiment scoring + union-find)
│       │   ├── moderator.ts        # Agent moderateur (analyse tensions + formulation questions)
│       │   ├── debate-engine.ts    # Boucle de debat multi-tour
│       │   ├── convergence.ts      # Detection de convergence (position shifts)
│       │   ├── ceo-followup.ts     # Extraction questions CEO + orchestration Final Arbiter
│       │   ├── synthesis.ts        # Synthese + verdict collectif
│       │   └── index.ts            # Exports publics
│       └── __tests__/
│           ├── fixtures.ts         # Donnees de test partagees
│           ├── friction.test.ts
│           ├── synthesis.test.ts
│           ├── json-parsing.test.ts
│           ├── moderator.test.ts
│           ├── convergence.test.ts
│           ├── debate-engine.test.ts
│           └── ceo-followup.test.ts
└── public/
    └── avatars/                    # 6 SVG pixel art
```

---

## 9. Tests

84 tests (8 fichiers) couvrant :
- Friction detection (scoring, paires, fallback, multi-membres)
- Synthesis (consensus, compromis, impasses, verdict collectif)
- JSON parsing (extraction depuis streams LLM)
- Moderator (formulation questions, identification tensions)
- Convergence detection (position shifts, seuils)
- Debate engine (boucle multi-tour, arret, outcomes)
- CEO follow-up (extraction heuristique, dedup, priorisation, limites)
