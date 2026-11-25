---
name: fiche-connaissance
description: Format et règles de rédaction des fiches de connaissance d'aiiron (knowledge/). À utiliser par tous les experts dès qu'on crée ou modifie une fiche, un principe d'entraînement, de nutrition ou de santé, ou une règle chiffrée destinée aux moteurs.
---

# Fiche de connaissance

Une fiche = un principe ou une méthode, dans `knowledge/<domaine>/<id>.md`.

## En-tête obligatoire

```yaml
---
id: force-rpe-table
domaine: force            # force | hypertrophie | course | nutrition | sante-physique | sante-mentale | echauffement | mobilite | etirements
titre: Table RPE et calcul de charge
niveau_preuve: B          # A consensus / méta-analyses · B études solides · C études limitées · E avis d'experts / heuristique de coach
sources:
  - titre: "Titre exact de la publication ou du document"
    auteurs: "Nom et al."
    annee: 2020
    url: "https://..."
statut: brouillon         # brouillon | valide (seul Pierrot passe une fiche en valide)
auteur_agent: expert-force
derniere_revue: 2026-11-24
---
```

## Corps

1. **Principe** — en 3 à 6 phrases, avec nos mots.
2. **Règles pour aiiron** — règles chiffrées et testables, chacune reliée à une source ou marquée `heuristique à valider`. Ce sont elles que le moteur implémente.
3. **Limites et contre-indications** — quand la règle ne s'applique pas, et quand orienter vers un professionnel.
4. **Exemple** — un cas concret (athlète, données, résultat attendu), réutilisable comme test.

## Règles de rédaction

- Paraphraser : aucune phrase copiée d'un livre, d'un programme payant ou d'un article. Une citation très courte est acceptable seulement si la formulation exacte compte.
- Privilégier les sources primaires (méta-analyses, position stands, recommandations officielles) aux blogs.
- Avant de marquer une règle `heuristique à valider`, chercher (WebSearch, WebFetch) une source fiable : étude ou revue de chercheurs, ou à défaut un coach reconnu qui publie ses justifications (article, livre, podcast daté). Citer ce qui a été trouvé, même partiel ; si rien n'est trouvé, l'écrire dans la fiche.
- Toute règle reprise ailleurs (docs/contexte.md, spec de moteur) pointe vers sa fiche : la source vit dans la fiche, pas dans le résumé.
- Si les sources se contredisent, le dire et proposer un choix par défaut prudent.
- Aucune donnée réelle d'utilisateur.
- Français, phrases courtes.
