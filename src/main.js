import { animate } from './controllers.js';
import { setupXR } from './setup.js';
import { initScene } from './setup.js';
import { loadSkeleton } from './loader.js';
import { setupControllers } from './controllers.js';

let renderer, scene, camera, selectedBoneIndex, bonesOrder;

async function main() {
  // Initialisation de la scène
  ({ scene, camera, renderer } = initScene());
  
  // Charger le modèle
  loadSkeleton(scene);

  // Configurer WebXR
  await setupXR(renderer);

  // Configurer les contrôleurs XR
  setupControllers(renderer, scene);

  // Animation Loop
  renderer.setAnimationLoop((timestamp, frame) => {
    animate(renderer, scene, camera, frame);
  });
}

main();

export { selectedBoneIndex, bonesOrder };
