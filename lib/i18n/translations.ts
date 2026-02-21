export type Locale = "en" | "fr";

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "header.title": "BOARDROOM AI",
    "header.subtitle": "AI EXECUTIVE DECISION ENGINE",
    "header.newAnalysis": "NEW ANALYSIS",

    // Hero
    "hero.headline1": "YOUR IDEA JUST ENTERED THE BOARDROOM.",
    "hero.headline2": "NOT EVERYONE SURVIVES.",
    "hero.subtext1": "Pitch your startup idea. 6 AI executives will debate it live.",
    "hero.subtext2": "Free. No signup.",
    "hero.placeholder": "Describe your startup idea in 2-3 sentences...",
    "hero.hideOptions": "HIDE OPTIONS",
    "hero.advancedOptions": "ADVANCED OPTIONS",
    "hero.tryExample": "TRY AN EXAMPLE",
    "hero.faceTheBoard": "FACE THE BOARD \u2192",
    "hero.exampleBriefing": `We're building "MealPlan AI" — a mobile-first SaaS that generates personalized weekly meal plans using AI. The user inputs dietary preferences, allergies, budget, and cooking skill level. The AI generates a 7-day plan with recipes, a grocery list, and estimated costs.

Target audience: health-conscious millennials (25-40) who want to eat better but hate planning meals. They currently use a mix of Pinterest, random recipe apps, and impulse grocery shopping.

Monetization: freemium model. Free tier = 1 plan/week with ads. Pro tier at $9.99/month = unlimited plans, nutritional tracking, grocery delivery integration.

Tech stack: React Native, Node.js backend, OpenAI API for recipe generation. MVP timeline: 6 weeks. Budget: $2,000 (API costs + design).

Competition: Mealime (free, no AI), Eat This Much (AI but ugly UX), ChatGPT (generic, no structure). Our edge: beautiful UX + structured output + grocery integration.`,
    "hero.exampleCeoVision": "Focus on go-to-market strategy and unit economics",

    // Advanced options
    "options.ceoVision": "CEO VISION (OPTIONAL)",
    "options.ceoVisionPlaceholder": "Focus: e.g. 'Unit economics' or 'Go-to-market strategy'",
    "options.aiModel": "AI MODEL",
    "options.demoMode":
      "DEMO MODE \u2014 Bring your own OpenRouter API key to unlock Claude, GPT, Gemini and more.",

    // Demo badge
    "demo.badge": "DEMO MODE",
    "demo.free": "\u2014 Free, no key needed",

    // Board preview
    "board.theBoard": "THE BOARD",

    // Analysis complete
    "complete.duration": "ANALYSIS COMPLETE \u2014 {duration}s",

    // Error
    "error.title": "ERROR DETECTED",
    "error.retry": "RETRY",

    // Footer
    "footer.builtBy":
      "Built by a non-dev consultant learning to code in public. Feedback, roasts, ideas \u2014 all welcome.",
    "footer.dmX": "DM ME ON X \u2192",
    "footer.email": "EMAIL ME \u2192",
    "footer.credit": "BOARDROOM AI by",
    "footer.evolvedMonkey": "EVOLVED MONKEY",
    "footer.poweredBy": "\u2014 POWERED BY OPENROUTER",

    // Role titles
    "role.cpo": "Chief Product Officer",
    "role.cmo": "Chief Marketing Officer",
    "role.cfo": "Chief Financial Officer",
    "role.cro": "Chief Research Officer",
    "role.cco": "Chief Creative Officer",
    "role.cto": "Chief Technology Officer",

    // Phase tracker
    "phase.round1": "RND 1",
    "phase.frictions": "SCAN",
    "phase.round2": "RND 2",
    "phase.synthesis": "SYNTH",
    "phase.complete": "DONE",

    // ShareImage
    "shareImage.button": "SHARE IMAGE",
    "shareImage.subtitle": "MULTI-AGENT DECISION ENGINE",
    "shareImage.collectiveVerdict": "COLLECTIVE VERDICT",
    "shareImage.footer": "Built by evolved monkey \u2014 x.com/evolved_monkey_",

    // BoardRoom
    "boardroom.members": "BOARDROOM AI MEMBERS",
    "boardroom.frictionDetected": "FRICTION DETECTED",
    "boardroom.moderator": "MODERATOR",
    "boardroom.analyzingFriction": "Analyzing friction points...",
    "boardroom.multiTurnDebate": "MULTI-TURN DEBATE",
    "boardroom.synthesisFinalJudgment": "SYNTHESIS \u2014 FINAL JUDGMENT",
    "boardroom.collectiveVerdict": "COLLECTIVE VERDICT",
    "boardroom.consensus": "CONSENSUS \u2014 {verdict}",
    "boardroom.consensusDesc":
      "The board converged on {verdict} \u2014 key recommendations from each member",
    "boardroom.compromises": "COMPROMISES",
    "boardroom.compromisesDesc": "Agreements reached during debate",
    "boardroom.impasses": "IMPASSES",
    "boardroom.impassesDesc": "Unresolved disagreements after debate",
    "boardroom.unresolvedConcerns": "UNRESOLVED CONCERNS",
    "boardroom.unresolvedConcernsDesc": "Issues raised by non-debating members",
    "boardroom.battlePhase": "BATTLE PHASE",

    // ViabilityScore
    "viability.label": "VIABILITY SCORE",

    // CEO one-liner translations
    "ceoOneLiner.Ship it. The board is behind you.": "Ship it. The board is behind you.",
    "ceoOneLiner.Promising, but the CFO has questions.": "Promising, but the CFO has questions.",
    "ceoOneLiner.Pivot territory. Listen to the CTO.": "Pivot territory. Listen to the CTO.",
    "ceoOneLiner.Back to the whiteboard. The board says no.":
      "Back to the whiteboard. The board says no.",

    // CEOFollowUp
    "ceo.sourceChallenge": "Round 1 challenge",
    "ceo.sourceDebate": "Unresolved debate",
    "ceo.boardNeedsInput": "THE BOARD NEEDS YOUR INPUT",
    "ceo.unresolvedQuestions": "{count} unresolved question{s} from the debate",
    "ceo.answerPlaceholder": "Your answer...",
    "ceo.getFinalVerdict": "GET FINAL VERDICT ({filled}/{total})",
    "ceo.answerHint":
      "Answer at least 1 question \u2014 the board will deliver a definitive verdict",

    // FinalVerdict
    "finalVerdict.deliberation": "FINAL DELIBERATION",
    "finalVerdict.weighing": "The Final Arbiter is weighing all perspectives...",
    "finalVerdict.title": "FINAL VERDICT",
    "finalVerdict.reasoning": "REASONING",
    "finalVerdict.keyActions": "KEY ACTIONS",
    "finalVerdict.risks": "ACKNOWLEDGED RISKS",
    "finalVerdict.nextSteps": "NEXT STEPS",

    // DebateThread
    "debate.challenge": "CHALLENGE",
    "debate.response": "RESPONSE",
    "debate.counter": "COUNTER",
    "debate.concession": "CONCESSION",
    "debate.holds": "HOLDS",
    "debate.softened": "SOFTENED",
    "debate.reversed": "REVERSED",
    "debate.converged": "CONVERGENCE REACHED",
    "debate.impasse": "IMPASSE \u2014 CEO MUST DECIDE",
    "debate.maxTurns": "MAX TURNS \u2014 NO RESOLUTION",
    "debate.moderator": "MODERATOR",
    "debate.evaluating": "Evaluating arguments...",
    "debate.thinking": "is thinking...",

    // MemberCard
    "member.analyzing": "ANALYZING...",
    "member.standby": "Standby",
    "member.clickToInspect": "CLICK TO INSPECT",

    // MemberDetail
    "detail.close": "CLOSE",
    "detail.verdict": "VERDICT:",
    "detail.analysis": "ANALYSIS",
    "detail.challenges": "CHALLENGES FOR CEO",
    "detail.verdictDetails": "VERDICT DETAILS",

    // ShareButton
    "share.linkCopied": "LINK COPIED!",
    "share.shareVerdict": "SHARE YOUR VERDICT",
    "share.shareX": "SHARE ON X",
    "share.shareLinkedIn": "SHARE ON LINKEDIN",
    "share.copied": "COPIED!",
    "share.copyLink": "COPY LINK",

    // ExportButton
    "export.download": "\u2B07 DOWNLOAD BOARDROOM REPORT \u2B07",

    // ApiKeyInput
    "apiKey.active": "KEY ACTIVE: ****{lastFour}",
    "apiKey.change": "[CHANGE]",
    "apiKey.label": "OPENROUTER API KEY",
    "apiKey.placeholder": "sk-or-...",
    "apiKey.save": "SAVE",
    "apiKey.getKey": "GET AN OPENROUTER API KEY \u2192",

    // LiveCounters
    "counter.ideaDebated": "IDEA DEBATED",
    "counter.ideasDebated": "IDEAS DEBATED",
    "counter.unnamed": "Unnamed idea",

    // Verdict page
    "verdict.notFound": "VERDICT NOT FOUND",
    "verdict.invalidLink": "This verdict link is invalid or expired.",
    "verdict.goHome": "GO TO BOARDROOM AI",
    "verdict.theIdea": "THE IDEA",
    "verdict.boardVerdicts": "BOARD VERDICTS",
    "verdict.collectiveVerdict": "COLLECTIVE VERDICT",
    "verdict.faceTheBoard": "FACE THE BOARD YOURSELF",
    "verdict.cta": "Free. No signup. 6 AI executives debate your idea live.",

    // Markdown export
    "md.title": "BoardRoom Report \u2014 {projectName} \u2014 {date}",
    "md.ceoVision": "CEO Vision",
    "md.ceoVisionDefault": "(Not specified)",
    "md.viabilityScore": "Viability Score: {score}/10",
    "md.individualVerdicts": "Individual Verdicts",
    "md.collectiveVerdict": "Collective Verdict: **{verdict}**",
    "md.round1": "Round 1 \u2014 Independent Analyses",
    "md.challengesCeo": "Challenges for the CEO:",
    "md.frictionPoints": "Friction Points",
    "md.multiTurnDebate": "Multi-Turn Debate",
    "md.outcome": "Outcome: {outcome} ({turns} turns)",
    "md.moderator": "Moderator:",
    "md.position": "Position: {shift}",
    "md.resolution": "Resolution:",
    "md.synthesis": "Synthesis",
    "md.consensus": "Consensus",
    "md.compromises": "Compromises Found",
    "md.impasses": "Impasses (CEO must decide)",
    "md.unresolvedConcerns": "Unresolved Concerns (silent members)",
    "md.ceoFollowUp": "CEO Follow-Up Questions",
    "md.sourceChallenge": "Round 1",
    "md.sourceDebate": "Debate",
    "md.ceoAnswers": "CEO Answers",
    "md.finalVerdict": "Final Verdict: **{verdict}**",
    "md.keyActions": "Key Actions",
    "md.acknowledgedRisks": "Acknowledged Risks",
    "md.nextSteps": "Next Steps",
    "md.generatedBy": "Generated by BoardRoom AI \u2014 {duration}",
  },
  fr: {
    // Header
    "header.title": "BOARDROOM AI",
    "header.subtitle": "MOTEUR DE DECISION PAR IA",
    "header.newAnalysis": "NOUVELLE ANALYSE",

    // Hero
    "hero.headline1": "VOTRE IDEE VIENT D'ENTRER AU CONSEIL.",
    "hero.headline2": "TOUT LE MONDE N'EN SORT PAS VIVANT.",
    "hero.subtext1": "Pitchez votre idee. 6 dirigeants IA vont en debattre en direct.",
    "hero.subtext2": "Gratuit. Sans inscription.",
    "hero.placeholder": "Decrivez votre idee de startup en 2-3 phrases...",
    "hero.hideOptions": "MASQUER LES OPTIONS",
    "hero.advancedOptions": "OPTIONS AVANCEES",
    "hero.tryExample": "ESSAYER UN EXEMPLE",
    "hero.faceTheBoard": "AFFRONTER LE CONSEIL \u2192",
    "hero.exampleBriefing": `On construit "MealPlan AI" — un SaaS mobile-first qui genere des plans de repas hebdomadaires personnalises grace a l'IA. L'utilisateur entre ses preferences alimentaires, allergies, budget et niveau en cuisine. L'IA genere un plan sur 7 jours avec recettes, liste de courses et couts estimes.

Cible : millennials soucieux de leur sante (25-40 ans) qui veulent mieux manger mais detestent planifier leurs repas. Ils utilisent actuellement un mix de Pinterest, d'apps de recettes et font leurs courses au feeling.

Monetisation : modele freemium. Gratuit = 1 plan/semaine avec pubs. Pro a 9,99€/mois = plans illimites, suivi nutritionnel, integration livraison courses.

Stack technique : React Native, backend Node.js, API OpenAI pour la generation de recettes. Delai MVP : 6 semaines. Budget : 2 000€ (couts API + design).

Concurrence : Mealime (gratuit, sans IA), Eat This Much (IA mais UX moche), ChatGPT (generique, pas structure). Notre avantage : UX soignee + output structure + integration courses.`,
    "hero.exampleCeoVision": "Focus sur la strategie go-to-market et l'unit economics",

    // Advanced options
    "options.ceoVision": "VISION DU CEO (OPTIONNEL)",
    "options.ceoVisionPlaceholder": "Focus : ex. 'Unit economics' ou 'Strategie go-to-market'",
    "options.aiModel": "MODELE IA",
    "options.demoMode":
      "MODE DEMO \u2014 Apportez votre cle API OpenRouter pour debloquer Claude, GPT, Gemini et plus.",

    // Demo badge
    "demo.badge": "MODE DEMO",
    "demo.free": "\u2014 Gratuit, sans cle",

    // Board preview
    "board.theBoard": "LE CONSEIL",

    // Analysis complete
    "complete.duration": "ANALYSE TERMINEE \u2014 {duration}s",

    // Error
    "error.title": "ERREUR DETECTEE",
    "error.retry": "REESSAYER",

    // Footer
    "footer.builtBy":
      "Construit par un consultant non-dev qui apprend a coder en public. Retours, critiques, idees \u2014 bienvenue.",
    "footer.dmX": "DM SUR X \u2192",
    "footer.email": "M'ENVOYER UN EMAIL \u2192",
    "footer.credit": "BOARDROOM AI par",
    "footer.evolvedMonkey": "EVOLVED MONKEY",
    "footer.poweredBy": "\u2014 PROPULSE PAR OPENROUTER",

    // Role titles
    "role.cpo": "Directeur Produit",
    "role.cmo": "Directeur Marketing",
    "role.cfo": "Directeur Financier",
    "role.cro": "Directeur Recherche",
    "role.cco": "Directeur Creatif",
    "role.cto": "Directeur Technique",

    // Phase tracker
    "phase.round1": "TOUR 1",
    "phase.frictions": "FRICT.",
    "phase.round2": "TOUR 2",
    "phase.synthesis": "SYNTH",
    "phase.complete": "FIN",

    // ShareImage
    "shareImage.button": "PARTAGER L'IMAGE",
    "shareImage.subtitle": "MOTEUR DE DECISION MULTI-AGENTS",
    "shareImage.collectiveVerdict": "VERDICT COLLECTIF",
    "shareImage.footer": "Cree par evolved monkey \u2014 x.com/evolved_monkey_",

    // BoardRoom
    "boardroom.members": "MEMBRES DU CONSEIL",
    "boardroom.frictionDetected": "FRICTION DETECTEE",
    "boardroom.moderator": "MODERATEUR",
    "boardroom.analyzingFriction": "Analyse des points de friction...",
    "boardroom.multiTurnDebate": "DEBAT MULTI-TOURS",
    "boardroom.synthesisFinalJudgment": "SYNTHESE \u2014 JUGEMENT FINAL",
    "boardroom.collectiveVerdict": "VERDICT COLLECTIF",
    "boardroom.consensus": "CONSENSUS \u2014 {verdict}",
    "boardroom.consensusDesc":
      "Le conseil a converge vers {verdict} \u2014 recommandations cles de chaque membre",
    "boardroom.compromises": "COMPROMIS",
    "boardroom.compromisesDesc": "Accords trouves pendant le debat",
    "boardroom.impasses": "IMPASSES",
    "boardroom.impassesDesc": "Desaccords non resolus apres le debat",
    "boardroom.unresolvedConcerns": "PREOCCUPATIONS NON RESOLUES",
    "boardroom.unresolvedConcernsDesc": "Points souleves par les membres non-debattants",
    "boardroom.battlePhase": "PHASE DE BATAILLE",

    // ViabilityScore
    "viability.label": "SCORE DE VIABILITE",

    // CEO one-liner translations
    "ceoOneLiner.Ship it. The board is behind you.": "Foncez. Le conseil vous soutient.",
    "ceoOneLiner.Promising, but the CFO has questions.": "Prometteur, mais le CFO a des questions.",
    "ceoOneLiner.Pivot territory. Listen to the CTO.": "Zone de pivot. Ecoutez le CTO.",
    "ceoOneLiner.Back to the whiteboard. The board says no.":
      "Retour au tableau blanc. Le conseil dit non.",

    // CEOFollowUp
    "ceo.sourceChallenge": "Defi du Round 1",
    "ceo.sourceDebate": "Debat non resolu",
    "ceo.boardNeedsInput": "LE CONSEIL A BESOIN DE VOTRE AVIS",
    "ceo.unresolvedQuestions": "{count} question{s} non resolue{s} du debat",
    "ceo.answerPlaceholder": "Votre reponse...",
    "ceo.getFinalVerdict": "OBTENIR LE VERDICT FINAL ({filled}/{total})",
    "ceo.answerHint":
      "Repondez a au moins 1 question \u2014 le conseil rendra un verdict definitif",

    // FinalVerdict
    "finalVerdict.deliberation": "DELIBERATION FINALE",
    "finalVerdict.weighing": "L'Arbitre Final pese toutes les perspectives...",
    "finalVerdict.title": "VERDICT FINAL",
    "finalVerdict.reasoning": "RAISONNEMENT",
    "finalVerdict.keyActions": "ACTIONS CLES",
    "finalVerdict.risks": "RISQUES RECONNUS",
    "finalVerdict.nextSteps": "PROCHAINES ETAPES",

    // DebateThread
    "debate.challenge": "DEFI",
    "debate.response": "REPONSE",
    "debate.counter": "CONTRE",
    "debate.concession": "CONCESSION",
    "debate.holds": "MAINTIENT",
    "debate.softened": "ASSOUPLI",
    "debate.reversed": "INVERSE",
    "debate.converged": "CONVERGENCE ATTEINTE",
    "debate.impasse": "IMPASSE \u2014 LE CEO DOIT DECIDER",
    "debate.maxTurns": "TOURS MAX \u2014 PAS DE RESOLUTION",
    "debate.moderator": "MODERATEUR",
    "debate.evaluating": "Evaluation des arguments...",
    "debate.thinking": "reflechit...",

    // MemberCard
    "member.analyzing": "ANALYSE...",
    "member.standby": "En attente",
    "member.clickToInspect": "CLIQUER POUR INSPECTER",

    // MemberDetail
    "detail.close": "FERMER",
    "detail.verdict": "VERDICT :",
    "detail.analysis": "ANALYSE",
    "detail.challenges": "DEFIS POUR LE CEO",
    "detail.verdictDetails": "DETAILS DU VERDICT",

    // ShareButton
    "share.linkCopied": "LIEN COPIE !",
    "share.shareVerdict": "PARTAGER VOTRE VERDICT",
    "share.shareX": "PARTAGER SUR X",
    "share.shareLinkedIn": "PARTAGER SUR LINKEDIN",
    "share.copied": "COPIE !",
    "share.copyLink": "COPIER LE LIEN",

    // ExportButton
    "export.download": "\u2B07 TELECHARGER LE RAPPORT \u2B07",

    // ApiKeyInput
    "apiKey.active": "CLE ACTIVE : ****{lastFour}",
    "apiKey.change": "[CHANGER]",
    "apiKey.label": "CLE API OPENROUTER",
    "apiKey.placeholder": "sk-or-...",
    "apiKey.save": "ENREGISTRER",
    "apiKey.getKey": "OBTENIR UNE CLE API OPENROUTER \u2192",

    // LiveCounters
    "counter.ideaDebated": "IDEE DEBATTUE",
    "counter.ideasDebated": "IDEES DEBATTUES",
    "counter.unnamed": "Idee sans nom",

    // Verdict page
    "verdict.notFound": "VERDICT INTROUVABLE",
    "verdict.invalidLink": "Ce lien de verdict est invalide ou expire.",
    "verdict.goHome": "ALLER A BOARDROOM AI",
    "verdict.theIdea": "L'IDEE",
    "verdict.boardVerdicts": "VERDICTS DU CONSEIL",
    "verdict.collectiveVerdict": "VERDICT COLLECTIF",
    "verdict.faceTheBoard": "AFFRONTEZ LE CONSEIL VOUS-MEME",
    "verdict.cta": "Gratuit. Sans inscription. 6 dirigeants IA debattent votre idee en direct.",

    // Markdown export
    "md.title": "Rapport BoardRoom \u2014 {projectName} \u2014 {date}",
    "md.ceoVision": "Vision du CEO",
    "md.ceoVisionDefault": "(Non specifie)",
    "md.viabilityScore": "Score de viabilite : {score}/10",
    "md.individualVerdicts": "Verdicts individuels",
    "md.collectiveVerdict": "Verdict collectif : **{verdict}**",
    "md.round1": "Round 1 \u2014 Analyses independantes",
    "md.challengesCeo": "Defis pour le CEO :",
    "md.frictionPoints": "Points de friction",
    "md.multiTurnDebate": "Debat multi-tours",
    "md.outcome": "Resultat : {outcome} ({turns} tours)",
    "md.moderator": "Moderateur :",
    "md.position": "Position : {shift}",
    "md.resolution": "Resolution :",
    "md.synthesis": "Synthese",
    "md.consensus": "Consensus",
    "md.compromises": "Compromis trouves",
    "md.impasses": "Impasses (le CEO doit decider)",
    "md.unresolvedConcerns": "Preoccupations non resolues (membres silencieux)",
    "md.ceoFollowUp": "Questions de suivi du CEO",
    "md.sourceChallenge": "Round 1",
    "md.sourceDebate": "Debat",
    "md.ceoAnswers": "Reponses du CEO",
    "md.finalVerdict": "Verdict final : **{verdict}**",
    "md.keyActions": "Actions cles",
    "md.acknowledgedRisks": "Risques reconnus",
    "md.nextSteps": "Prochaines etapes",
    "md.generatedBy": "Genere par BoardRoom AI \u2014 {duration}",
  },
};
