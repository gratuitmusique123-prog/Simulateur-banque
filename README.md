# Simulation Bank • banque et TPE fictifs

Une petite application web gratuite pour simuler la génération de cartes, les paiements, le solde et l'historique. **Elle ne génère aucune carte bancaire réelle et n'utilise pas Apple Pay.** Elle ne donne pas accès à Apple Intelligence.

## Utilisation immédiate sur iPhone avec GitHub Pages

1. Ouvrez le dépôt `gratuitmusique123-prog/Simulateur-banque` déjà créé.
2. Les fichiers de l'application se trouvent à la racine du dépôt.
3. Dans **Settings > Pages**, sélectionnez **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Ouvrez l'URL affichée dans cette page des paramètres, puis dans Safari choisissez **Partager > Sur l'écran d'accueil**.
5. L'interface est autonome. Les données sont conservées *dans le navigateur de cet appareil*. Ce mode ne synchronise pas deux iPhone entre eux.

Dans l'application Raccourcis, créez un raccourci avec deux actions **URL** (URL de votre site, suffixe `#dashboard` ou `#tpe`) puis **Ouvrir les URL**. Aucune action « Utiliser un modèle » n'est nécessaire.

## Mode serveur de démonstration, pour synchroniser plusieurs téléphones

Sur un ordinateur Windows avec Node.js 18 ou supérieur, ouvrez le dossier et lancez :

```powershell
node server.js
```

Le site est accessible localement sur `http://127.0.0.1:8787`.

Pour que plusieurs appareils du même réseau accèdent au même état, définissez une clé de test et liez le serveur au réseau local :

```powershell
$env:HOST = '0.0.0.0'
$env:SIM_BANK_TOKEN = 'choisir-une-cle-secrete-longue'
node server.js
```

**Important** : ouvrez l'adresse du serveur depuis Safari sur les appareils du même réseau, puis dans **Options > Connexion au serveur local**, saisissez la clé `SIM_BANK_TOKEN`. La clé est conservée uniquement dans la session du navigateur et jamais dans GitHub. Pour une démonstration d'API via Raccourcis, envoyez l'en-tête HTTP `Authorization: Bearer choisir-une-cle-secrete-longue`. Le serveur HTTP est prévu pour un LAN de confiance uniquement, pas pour Internet. Sur GitHub Pages, le mode autonome reste local à chaque navigateur ; **les données ne se synchronisent entre appareils que lorsqu'ils visitent le serveur Node commun.**

### Endpoints pour Raccourcis

Toutes les opérations renvoient du JSON :

- `GET /api/status` : serveur disponible.
- `GET /api/state` : solde, cartes et historique.
- `POST /api/cards` avec `{}` : nouvelle carte simulée.
- `POST /api/pay` avec `{"cardId":"SIM-...","amountCents":2500,"pin":"1234","idempotencyKey":"uuid-unique"}` : paiement fictif.
- `POST /api/credit` avec `{"amountCents":10000}` : crédit fictif.
- `POST /api/toggle` avec `{"cardId":"SIM-..."}` : bloque / active une carte.
- `POST /api/reset` avec `{"confirm":"RESET"}` : réinitialisation.

Dans Raccourcis : **URL > Obtenir le contenu de l'URL**, méthode **POST**, corps **JSON**, puis **Afficher le résultat** ou **Obtenir la valeur du dictionnaire**. Ajoutez l'en-tête `Authorization` si vous avez activé la clé. Toutes les sommes sont en centimes entiers, le code `1234` est **uniquement un code de démonstration**.

## Sécurité et limites

- Aucune connexion aux réseaux Visa, Mastercard ni aux comptes bancaires.
- Ne fonctionne pas comme carte de paiement Apple Wallet ou Apple Pay.
- GitHub Pages sert des fichiers statiques, pas un serveur transactionnel.
- Les données locales peuvent être perdues si l'utilisateur efface les données Safari.
- Le serveur Node est un prototype LAN pédagogique, pas un système financier réel.

## Générateur de raccourcis Apple sur Mac M1 GitHub

Un workflow automatique a été ajouté dans [GitHub Actions](https://github.com/gratuitmusique123-prog/Simulateur-banque/actions/workflows/shortcuts.yml).

- Sur une machine GitHub `macos-15` Apple Silicon, `tools/build_shortcuts.py` construit trois fichiers .shortcut contenant chacun deux actions natives : URL et Ouvrir les URL.
- Le raccourci **Simulation Bank** ouvre le tableau de bord ; **Simulation Bank - Cartes** génère une carte fictive à chaque ouverture de son URL ; **Simulation Bank - TPE** ouvre le simulateur de terminal.
- `tools/sign_shortcuts.py` essaie la signature officielle `shortcuts sign --mode anyone`, et conserve dans `dist/SIGNATURE-REPORT.json` les résultats ou les erreurs.
- L'artefact de build est disponible sur la page du workflow, après son exécution. **Les fichiers non signés ne sont pas importables directement sur iOS récent.** Seuls les fichiers `dist/signed/*.shortcut`, s'ils sont effectivement créés et validés, sont destinés à l'installation.
- Une machine GitHub sans compte Apple connecté peut refuser la signature. Un workflow CI n'est pas une session macOS interactive Apple Intelligence et ne peut pas créer de lien de partage iCloud à lui seul.

[Prompt intégral](PROMPT-RACCOURCIS.md) à utiliser sur un Mac personnel avec l'éditeur Raccourcis si l'on veut aller plus loin que les raccourcis lanceurs.

