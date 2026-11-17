# Prompt intégral pour créer une banque de simulation dans Raccourcis Apple

Tu es un expert des actions natives de l'application Raccourcis sur macOS 27 / iOS 27.

## But
Crée trois raccourcis iPhone exécutables et partageables, en français :
1. `Simulation Bank` (banque / tableau de bord)
2. `Simulation Bank - Cartes` (génération de cartes de test)
3. `Simulation Bank - TPE` (paiements de test)

Le projet GitHub source est https://github.com/gratuitmusique123-prog/Simulateur-banque.
L'interface web est accessible à https://gratuitmusique123-prog.github.io/Simulateur-banque/.

## Limites impératives
- Aucune vraie carte bancaire, aucune donnée de paiement réelle, aucun service de transfert d'argent.
- Ne jamais faire croire qu'une carte générée est acceptée par Apple Pay, Visa ou Mastercard.
- Ne jamais prétendre lire des jetons NFC Apple Pay avec des actions Raccourcis.
- Toutes les cartes ont des identifiants `SIM-<UUID>` uniques, et affichent clairement « SIMULATION ».
- Ne pas utiliser l'action `Utiliser un modèle` dans les raccourcis finaux : l'iPhone destinataire ne prend pas en charge Apple Intelligence.
- Ne pas inventer des actions Raccourcis qui n'existent pas ; vérifier chaque action.

## Banque
- Au premier lancement, proposer la création d'un portefeuille de simulation de 10 000,00 €.
- Menus : solde, mes cartes, créer une carte, virements de démonstration, historique, TPE, exporter.
- Enregistrer et lire des fichiers JSON dans `iCloud Drive/Shortcuts/SimulationBank` si la solution est autonome et mono-appareil.
- Ne jamais réinitialiser des données existantes à chaque ouverture.
- Les valeurs monétaires doivent toujours être manipulées en centimes entiers.
- Historique horodaté, identifiants de transaction uniques, statut accepté/refusé.

## Générateur
- Générer un UUID neuf avec une action native appropriée à chaque exécution.
- Enregistrer `SIM-UUID`, statut actif/bloqué et date fictive d'expiration.
- Afficher la carte, lui attribuer un compte fictif et créer une sortie exploitable par le TPE.
- Ne pas imposer de limite artificielle au nombre de cartes.
- Ajouter les cartes sans supprimer les anciennes.

## TPE
- Saisir un montant en euros, choisir ou scanner l'identifiant fictif d'une carte, puis demander un code PIN de démonstration (ex. 1234).
- Vérifier le montant, l'existence de la carte, son statut, le solde et le PIN fictif.
- Refuser sans débit si une vérification échoue.
- Débiter une seule fois pour un identifiant de transaction donné ; conserver le solde et le ticket.
- Afficher un reçu « SIMULATION • AUCUNE VALEUR FINANCIÈRE ».
- Prévoir un QR code ou un tag NFC d'automatisation iOS pour lancer la simulation ; ce n'est PAS du NFC Apple Pay.

## Synchronisation
- Mono-iPhone : données communes à tous les raccourcis.
- Multi-iPhone : utiliser une API privée distincte plutôt qu'un JSON iCloud Drive concurrent. Le dépôt contient `server.js`, un serveur Node.js de démonstration accessible sur un réseau local uniquement.
- Ne pas exposer le serveur sur Internet sans HTTPS, authentification et durcissement approprié.

## Livrable
- Construire de vraies actions natives, pas seulement afficher des messages d'information.
- Tester au minimum création de 2 cartes différentes, débit valide et invalide, PIN incorrect, sauvegarde/rechargement, absence de double débit.
- Exporter les trois fichiers .shortcut.
- Signer avec la commande Apple officielle `shortcuts sign --mode anyone` sur un Mac connecté à un compte Apple si nécessaire.
- Produire des fichiers partageables ou un lien iCloud créé via le dialogue de partage, et signaler honnêtement toute étape impossible.

## Alternative minimale déjà automatisée dans le dépôt
Le dépôt contient `tools/build_shortcuts.py` : il génère trois raccourcis natifs de lancement de l'interface web (banque, création de carte, TPE). Ils ne reproduisent pas toutes les étapes bancaires en actions natives, mais délèguent les fonctions au site et ne nécessitent pas Apple Intelligence sur l'iPhone.
