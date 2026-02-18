# Cahier des Charges — BoardRoom AI

**Plateforme d'Analyse Strategique Multi-Agents IA**

- **Date :** 18 fevrier 2026
- **Version :** 0.1.0
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
Debats Round 2 (LLM, membres en friction)
    |
    v
Synthese (code)
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
| Hebergement | Vercel | — |
| Langage | TypeScript | 5.9.3 |

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

Chaque membre rend un verdict specifique a son domaine :

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

## 4. Pipeline d'analyse (etat actuel)

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

### Phase 3 — Round 2 : Reactions au debat

- Uniquement pour les membres impliques dans des frictions
- Chaque membre recoit :
  - Son propre verdict Round 1
  - Les positions adverses des autres membres
- Reponse possible : `MAINTAIN` | `CONCEDE` | `COMPROMISE`
- **Duree typique :** 5-15 secondes

### Phase 4 — Synthese

- **Consensus** : Recommandations partagees (extraites des Round 1)
- **Compromis** : Frictions resolues par concession ou compromis
- **Impasses** : Frictions non resolues (le CEO doit decider)
- **Verdict collectif** : Moyenne des sentiments → `GO` | `GO_WITH_CHANGES` | `RETHINK`

### Cout estime par analyse

| Modele | Cout estime |
|--------|------------|
| DeepSeek V3.2 | ~$0.01 |
| Claude Sonnet 4.6 | ~$0.30 |
| Claude Opus 4.5 | ~$0.50 |

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
| Page principale | `app/page.tsx` | Hero, form, board, rapport, footer |
| Formulaire | `AnalysisForm.tsx` | Textarea briefing + CEO vision + select modele |
| Cle API | `ApiKeyInput.tsx` | BYOK OpenRouter avec localStorage |
| Salle du board | `BoardRoom.tsx` | Grille 2x3 des membres + phase tracker |
| Carte membre | `MemberCard.tsx` | Avatar SVG + streaming + verdict + detail modal |
| Detail membre | `MemberDetail.tsx` | Analyse complete, challenges, verdict details |
| Badge verdict | `VerdictBadge.tsx` | Badge colore avec glow (vert/orange/rouge) |
| Texte streaming | `StreamingText.tsx` | Texte en temps reel avec curseur clignotant |
| Export | `ExportButton.tsx` | Telecharger rapport BoardRoom Report en Markdown |
| Bouton retro | `RetroButton.tsx` | Bouton gradient or/orange avec effet 3D |

### Avatars

6 avatars SVG pixel art dans `public/avatars/` :
- vegeta.svg (CPO — aura orange)
- bulma.svg (CMO — aura bleue)
- piccolo.svg (CFO — aura verte)
- whis.svg (CRO — aura violette)
- gohan.svg (CCO — aura rouge)
- trunks.svg (CTO — aura cyan)

### Protocole SSE (9 types d'evenements)

```
state_change      → Met a jour la phase (round1, frictions, round2, synthesis)
member_chunk      → Texte streaming par membre (Round 1)
member_complete   → Resultat parse d'un membre (Round 1)
frictions_detected → Frictions identifiees
debate_chunk      → Texte streaming par membre (Round 2)
debate_complete   → Resultat parse d'un debat (Round 2)
synthesis_complete → Synthese finale
analysis_complete  → Rapport BoardRoom Report complet
error             → Message d'erreur
```

### Export BoardRoom Report

Le rapport final est exportable en Markdown avec la structure :
- En-tete (nom du projet, date, CEO vision)
- Verdicts individuels (resume par membre)
- Verdict collectif
- Analyses detaillees Round 1 (6 sections)
- Points de friction
- Debats Round 2
- Synthese (consensus, compromis, impasses)

---

## 6. Limites de l'architecture actuelle

### Pas de vrai debat inter-agents

L'architecture actuelle repose sur des **monologues paralleles** :

1. **Round 1 :** 6 appels LLM isoles — aucun agent ne voit les reponses des autres
2. **Friction :** Detection par code — comparaison mathematique des verdicts
3. **Round 2 :** 6 reactions isolees a des resumes — pas d'echange direct

**Ce qui manque :**
- Pas de conversation multi-tour entre agents
- Pas de citation/reponse directe aux arguments des autres
- Pas de convergence progressive par echange
- Un seul tour de reaction (Round 2) au lieu de plusieurs rounds de debat

### Comparaison avec un vrai debat

| Aspect | Architecture actuelle | Vrai debat multi-agents |
|--------|----------------------|------------------------|
| Interaction | Aucune (parallele) | Directe (sequentielle) |
| Tours | 2 (analyse + reaction) | 4-6 (attaque/defense/compromise) |
| Contexte partage | Resume des positions | Historique complet du debat |
| Convergence | Synthese par code | Emergence naturelle |
| Cout (DeepSeek) | ~$0.01 | ~$0.05 |
| Latence | 20-40s | 60-120s |

---

## 7. Feature a venir : Moteur de debat multi-agents

### Objectif

Remplacer le pipeline lineaire (Round 1 → Friction → Round 2 → Synthese) par un **vrai systeme de debat conversationnel** ou les agents interagissent directement, citent les arguments des autres, et convergent naturellement vers un consensus ou une impasse.

### Architecture cible

```
Round 1 (inchange — 6 analyses paralleles)
    |
    v
Moderateur IA (nouveau)
    |  Analyse les 6 positions
    |  Identifie les 2-3 points de tension cles
    |  Formule des questions ciblees pour chaque membre
    v
Debat Multi-Tour (nouveau)
    |
    |  Tour 1 : Le moderateur pose une question a Membre A
    |  Tour 2 : Membre B repond a l'argument de A
    |  Tour 3 : Membre A contre-argumente
    |  Tour 4 : Membre C intervient sur un point specifique
    |  ... (max 4-5 tours par friction)
    |
    |  Arret quand : convergence detectee OU max tours atteint
    v
Synthese (enrichie par l'historique du debat)
```

### Le role du Moderateur

Un 7eme appel LLM avec un system prompt dedie :
- Lit toutes les analyses Round 1
- Identifie les axes de tension (pas juste les verdicts, mais les arguments sous-jacents)
- Formule des questions precises : "Vegeta, tu dis que le scope est trop large, mais Trunks estime que c'est faisable en 40h. Que reponds-tu a son estimation ?"
- Decide qui parle a chaque tour
- Detecte la convergence ou declare l'impasse

### Format d'un tour de debat

```typescript
interface DebateTurn {
  turnNumber: number;
  speaker: BoardMemberRole;
  addressedTo: BoardMemberRole[];
  type: "CHALLENGE" | "RESPONSE" | "COUNTER" | "CONCESSION" | "INTERVENTION";
  content: string;          // L'argument (2-4 phrases)
  quotedFrom?: string;      // Citation directe de l'argument auquel il repond
  positionShift?: "UNCHANGED" | "SOFTENED" | "REVERSED";
}
```

### Contexte cumule

A chaque tour, l'agent recoit :
1. Son analyse Round 1
2. **L'historique complet du debat** (tous les tours precedents)
3. La question du moderateur

Cela permet des reponses comme :
> "Piccolo mentionne un cout unitaire de 0.15EUR mais omet les economies d'echelle au-dela de 10K utilisateurs. Mon estimation inclut une reduction de 40% du cout API avec le batching."

### Conditions d'arret

Le debat s'arrete quand :
- Un agent fait une `CONCESSION` explicite
- Le moderateur detecte un `COMPROMISE` possible
- Le maximum de tours est atteint (4-5 par friction)
- Tous les agents maintiennent leurs positions (impasse declaree)

### Impact sur les couts

| Scenario | Appels LLM | Tokens output | Cout DeepSeek | Cout Sonnet |
|----------|-----------|---------------|---------------|-------------|
| Actuel (2 rounds) | ~12 | ~20K | $0.01 | $0.30 |
| Debat 3 tours/friction, 2 frictions | ~25 | ~50K | $0.03 | $0.75 |
| Debat 5 tours/friction, 3 frictions | ~40 | ~80K | $0.05 | $1.20 |
| Debat intense + moderateur | ~50 | ~120K | $0.07 | $1.80 |

**Conclusion :** Avec DeepSeek V3.2, meme un debat intense reste sous $0.10 par analyse. C'est le modele qui rend cette feature economiquement viable.

### Changements techniques requis

| Composant | Modification |
|-----------|-------------|
| `lib/engine/types.ts` | Ajouter `DebateTurn`, `ModeratorDecision`, `DebateHistory` |
| `lib/engine/moderator.ts` | **Nouveau** — Logique du moderateur |
| `lib/engine/debate-engine.ts` | **Nouveau** — Boucle de debat multi-tour |
| `lib/engine/engine-streaming.ts` | Remplacer Round 2 lineaire par boucle de debat |
| `lib/hooks/useAnalysisState.ts` | Ajouter etats pour l'historique du debat |
| `components/board/DebateThread.tsx` | **Nouveau** — UI conversation style chat |
| SSE events | Ajouter `debate_turn`, `moderator_question`, `debate_resolved` |

### UX du debat

Le debat serait affiche comme un **thread de conversation** :

```
MODERATEUR: Vegeta, tu recommandes de geler le dev pour faire des interviews
utilisateur. Bulma dit que le marche n'attendra pas. Que reponds-tu ?

VEGETA [CHALLENGE → BULMA]: Lancer sans validation c'est construire sur du
sable. Les "20 interviews" prennent 2 semaines, pas 6 mois. Le marche peut
attendre 14 jours.

BULMA [COUNTER → VEGETA]: 14 jours c'est optimiste. Recruter 20 utilisateurs
qualifies pour des interviews prend minimum 3-4 semaines. Pendant ce temps,
[concurrent X] lance sa v2.

PICCOLO [INTERVENTION]: Le vrai risque n'est ni le timing ni la validation —
c'est le burn rate. A 3.2K/mois de couts fixes, chaque semaine de retard
coute 800EUR. La question est : est-ce que les interviews reduisent le risque
de pivot de plus de 800EUR/semaine ?

VEGETA [CONCESSION → PICCOLO]: Point valide. Je revise ma position : lancer un
MVP minimal en parallele des interviews, budget max 2 semaines de dev.
```

---

## 8. Roadmap

### V0.1 (actuel) — MVP fonctionnel
- [x] 6 agents IA independants avec streaming
- [x] Detection de frictions par scoring de sentiment
- [x] Round 2 reactions (1 tour)
- [x] Synthese automatique
- [x] Interface RPG pixel art (theme DBZ)
- [x] Avatars SVG pixel art
- [x] Export BoardRoom Report Markdown
- [x] BYOK OpenRouter
- [x] Deploy Vercel

### V0.2 — Moteur de debat
- [ ] Agent moderateur
- [ ] Debat multi-tour (3-5 tours par friction)
- [ ] Historique de conversation cumule
- [ ] Detection de convergence automatique
- [ ] UI thread de conversation
- [ ] Nouveaux SSE events (debate_turn, moderator_question)

### V0.3 — Polish et viralite
- [ ] OG image dynamique (verdict + board members)
- [ ] Partage de rapport par lien unique
- [ ] Animations d'entree des personnages
- [ ] Son retro 8-bit (optionnel, mutable)
- [ ] Mode sombre/clair
- [ ] Responsive mobile

### V1.0 — Produit
- [ ] Historique des analyses (localStorage)
- [ ] Templates de briefing (pitch deck, feature spec, business case)
- [ ] Personnalisation des membres du board (swap personas)
- [ ] API publique pour integration
- [ ] Landing page avec demo interactive

---

## 9. Structure du projet

```
boardroom-ai/
├── app/
│   ├── layout.tsx                  # Fonts (Press Start 2P, VT323), metadata
│   ├── page.tsx                    # Page principale
│   ├── globals.css                 # Theme RPG pixel art complet
│   └── api/analyze/route.ts        # SSE endpoint (Edge Runtime)
├── components/
│   ├── board/
│   │   ├── BoardRoom.tsx           # Grille 2x3 + phase tracker + frictions + debats + synthese
│   │   ├── MemberCard.tsx          # Carte personnage avec avatar, streaming, verdict
│   │   ├── MemberDetail.tsx        # Modal analyse complete
│   │   └── VerdictBadge.tsx        # Badge verdict colore avec glow
│   ├── analysis/
│   │   ├── AnalysisForm.tsx        # Formulaire briefing + CEO vision + modele
│   │   └── StreamingText.tsx       # Texte temps reel avec curseur
│   ├── report/
│   │   └── ExportButton.tsx        # Telecharger BoardRoom Report.md
│   ├── settings/
│   │   └── ApiKeyInput.tsx         # BYOK OpenRouter + localStorage
│   └── ui/
│       └── RetroButton.tsx         # Bouton RPG gradient
├── lib/
│   ├── engine/
│   │   ├── types.ts                # Tous les types TypeScript
│   │   ├── board-members.ts        # 6 configs + system prompts detailles
│   │   ├── runner-streaming.ts     # Client OpenRouter streaming + JSON parsing
│   │   ├── engine-streaming.ts     # Orchestrateur pipeline complet
│   │   ├── friction.ts             # Detection frictions (sentiment scoring)
│   │   └── synthesis.ts            # Synthese + verdict collectif
│   ├── hooks/
│   │   ├── useBoardroomAnalysis.ts  # Hook SSE principal
│   │   ├── useAnalysisState.ts     # Reducer etat analyse (9 actions)
│   │   └── useApiKey.ts            # Hook localStorage cle API
│   └── utils/
│       ├── constants.ts            # Modeles, couleurs verdicts
│       └── markdown-export.ts      # Generateur rapport BoardRoom Report
└── public/
    └── avatars/                    # 6 SVG pixel art (vegeta, bulma, piccolo, whis, gohan, trunks)
```
