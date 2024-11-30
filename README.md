# SkelGuessr AR

## Description du Projet

**SkelGuessr AR** est un jeu éducatif interactif et immersif qui vise à améliorer vos connaissances sur l'anatomie osseuse humaine, maintenant intégrée en réalité augmentée (AR). Vous pouvez explorer un modèle 3D de l'anatomie humaine, placer le squelette dans votre environnement réel, et tenter de nommer correctement les os que vous séléctionnerez grâce à un système de questions à choix multiples (QCM).

Le jeu combine l'apprentissage de l'anatomie et des éléments d'amusement, avec des animations, des effets spéciaux et un environnement AR pour rendre l'étude de l'anatomie plus interactive.

## Objectifs

- **Éducation Interactive** : Rendre l'apprentissage de l'anatomie humaine interactif et ludique en utilisant la visualisation en réalité augmentée.
- **Immersion AR** : Utiliser des technologies de pointe comme `Three.js`, `WebXR`, et `Cannon.js` pour intégrer des éléments de réalité augmentée et des interactions physiques avec le squelette.

Ce projet est destiné aux étudiants, enseignants, ou toute personne intéressée par l'étude de l'anatomie de manière innovante et amusante.

## Fonctionnalités Principales

- **Réalité Augmentée** : Placez le squelette directement dans votre environnement en utilisant la caméra de votre appareil, et interagissez avec les os pour répondre au QCM.
- **Animations et Effets** : Animations spéciales pour les bonnes réponses, et effets physiques pour les réponses incorrectes, rendant chaque interaction captivante.
- **Interaction Intuitive** : Appuyez longuement sur l'écran (3 secondes) pour placer le squelette. Cliquez sur les os pour voir apparaitre les boutons de QCM. Vous pouvez placer le display de score ou bon vous semble. Vous pouvez replacer le squelette à tout moment.

## Mode d'Emploi

1. **Démarrage du Jeu** :
   - Appuyez sur le bouton **"START XR"** en bas de la page pour entrer en mode AR.
   - Assurez-vous que le sol soit bien détecté, et utilisez un **clic long (3 secondes)** pour placer le squelette dans votre environnement.

2. **Interactions avec le Squelette** :
   - **Cliquer sur les Os** : Lorsque vous cliquez sur un os, une question à choix multiples (QCM) s'affiche avec quatre propositions. Sélectionnez la bonne réponse parmi les choix.
   - **Déplacer le Squelette** : Vous pouvez replacer le squelette avec un clic long à tout moment si vous souhaitez le déplacer ailleurs dans l'environnement AR.

3. **Score et Feedback** :
   - Chaque bonne réponse vous fait gagner un point, et l'os s'illumine en vert. En cas de mauvaise réponse, l'os se "brise" et disparaît avec une animation d'explosion.
   - Le score est affiché en permanence sur une interface visible dans le monde AR, que vous pouvez déplacer par glisser-déposer.

4. **Menu et Règles** :
   - **Menu Accessible** : Avant de lancer le mode AR, vous pouvez accéder au menu pour voir les règles du jeu et les commandes.
   - **Règles** : Le bouton "Règles du jeu" vous explique comment jouer, placer le squelette, et répondre aux questions.

## Installation et Lancement

### Prérequis
- Un navigateur prenant en charge WebXR (de préférence Chrome).
- Une caméra fonctionnelle pour la réalité augmentée.
- Un téléphone disposant d'un gyroscope.

## Lien de Démo

- Accédez à une version en ligne du jeu ici : [Démo SkelGuessr AR](https://skel-guessr-realite-augmente-mea24bas7-baptisteprvts-projects.vercel.app)

## Membres du Groupe

- **Baptiste PREVOT** : Interactions QCM, physique.
- **Todd TAVERNIER** : Export du modèle 3D, déploiement.

## Tâches

- **Interactions QCM et Physique** : Détection des clics sur les os, création d'animations de succès et de fausses réponses, orientation des boutons, gestion des scores, etc.
- **Interactions avec le Squelette** : Placement et orientation du squelette dans l'environnement AR, mise à jour des animations.
- **Déploiement** : Déploiement du projet en ligne avec des outils comme Vercel.
- **Autre** : Ajout du son spatialisé, de l'ombre, ... .

## Fonctionnalités Techniques

- **Modèles 3D** : Le modèle du squelette est chargé en utilisant `FBXLoader` de `Three.js` et est observable en AR.
- **Animations et sons** : Utilisation de `Three.AnimationMixer` pour déclencher des animations en fonction des réponses du joueur. Le son est spatialisé.
- **Physique** : Intégration de `Cannon.js` pour gérer la physique et les interactions des os lors des mauvaises réponses.
- **XR et AR** : Utilisation de `WebXR` et `Three.js` pour permettre la réalité augmentée, avec des contrôles intuitifs pour le placement du squelette et les interactions.
- **Drag & Drop** : L'affichage du score peut être déplacé via drag & drop.
- **Ombre** : Projection d'une ombre pour le squelette.

## Améliorations Futures

- **Expérience Éducative Enrichie** : Ajouter des informations détaillées sur chaque os lorsque l'utilisateur clique dessus, pour rendre l'expérience plus éducative.

## Sources d'Inspiration et Ressources

- **Exemples et Documentation `Three.js`** : [Three.js Documentation](https://threejs.org/docs/) et [Three.js Examples](https://threejs.org/examples/). Particulièrement l'utilisation de [Hit Test](https://threejs.org/examples/?q=xr#webxr_ar_hittest).
- **Modèle 3D du Squelette** : Téléchargé à partir de [Z-Anatomy](https://www.z-anatomy.com/), modifié sur Blender pour ajuster les détails et l'échelle.
- **Animation de danse** : [Mixamo](https://www.mixamo.com/), modifiée pour l'adapter au modèle 3D.
- **Effets Sonores** : [Zapsplat](https://www.zapsplat.com/), pour les sons d'explosion et de succès.
- **Logo de page** : [Vecteezy](https://fr.vecteezy.com/png-gratuit/tete-de-mort)

## Remerciements

Merci d'avoir essayé **SkelGuessr AR** ! Nous espérons que cette application vous aidera à apprendre l'anatomie humaine de manière amusante et immersive. Si vous avez des suggestions ou des commentaires, n'hésitez pas à nous les faire parvenir.

**Petit tip** : Cette fois ci, pas besoin de passer tous les os pour l'animation finale. Il suffit de cliquer 5 fois en 2 secondes sur votre écran pour la déclancher. Rappuyez 5 fois rapidement pour l'arreter.
