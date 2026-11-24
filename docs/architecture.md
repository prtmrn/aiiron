# Architecture

## Deux équipes d'agents
1. **Construction** (ce repo, Claude Code) : la session principale orchestre les sous-agents de `.claude/agents/` qui produisent connaissances, persona et code.
2. **Production** (Claude Agent SDK) : aiiron est le seul interlocuteur de l'utilisateur. Il appelle des outils typés vers `engine/` et consulte des sous-agents experts quand c'est utile. Les sous-agents ne délèguent pas entre eux.

## Flux cible
WhatsApp → aiiron (LLM + outils) → moteurs (`engine/`) + mémoire (Postgres UE) + données (Hevy, Open Wearables, Health Auto Export) → réponse, documents (PDF/xlsx), séances poussées sur Hevy ou la montre (Garmin Training API).

Détails à compléter par `expert-ia` et `developpeur`.
