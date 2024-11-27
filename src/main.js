import { animate } from './controllers.js';
import { setupXR } from './setup.js';
import { initScene } from './setup.js';
import { loadSkeleton } from './loader.js';
import { setupControllers } from './controllers.js';
import { createScoreDisplay, updateScoreDisplay } from './utils.js';

/*
Variables :
renderer: Rendu de la scène
scene: Scène 3D
camera: Caméra
selectedBoneIndex: Index de l'os sélectionné
bonesOrder: Ordre des os
*/
let renderer, scene, camera, selectedBoneIndex, bonesOrder;

async function main() {
  document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const menuContent = document.querySelector('.menu-content');
    const rulesButton = document.getElementById('rules-button');
    const rulesModal = document.getElementById('rules-modal');
    const closeModal = document.querySelector('.close-modal');
  
    let menuVisible = true;

    function toggleMenu() {
      menuVisible = !menuVisible;
      menuContent.style.display = menuVisible ? 'block' : 'none';
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('touchstart', (event) => {
      event.preventDefault();
      toggleMenu();
    });

    function showRules() {
      rulesModal.classList.remove('hidden');
    }

    rulesButton.addEventListener('click', showRules);
    rulesButton.addEventListener('touchstart', (event) => {
      event.preventDefault();
      showRules();
    });

    function closeRulesModal() {
      rulesModal.classList.add('hidden');
    }

    closeModal.addEventListener('click', closeRulesModal);
    closeModal.addEventListener('touchstart', (event) => {
      event.preventDefault();
      closeRulesModal();
    });

    rulesModal.addEventListener('click', (e) => {
      if (e.target === rulesModal) {
        closeRulesModal();
      }
    });

    rulesModal.addEventListener('touchstart', (e) => {
      if (e.target === rulesModal) {
        closeRulesModal();
      }
    });
  });

  // Initialisation de la scène
  ({ scene, camera, renderer } = initScene());
  
  // Charger le modèle
  loadSkeleton(scene);

  // Configurer WebXR
  await setupXR(renderer);

  // Configurer les contrôleurs XR
  setupControllers(renderer, scene);

  // Créer l'affichage du score
  createScoreDisplay(scene);

  // Animation Loop
  renderer.setAnimationLoop((timestamp, frame) => {
    animate(renderer, scene, camera, frame);
  });
}

main();

//Export des variables
export { selectedBoneIndex, bonesOrder };
