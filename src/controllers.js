import * as THREE from 'three';
import { bonesGroup } from './loader.js';
import { addButtonsAroundBone, removeButtonsAndLines, fillQCMButtons, checkAnswer } from './utils.js';

let hitTestSourceRequested = false;
let hitTestSource = null;
let reticle;
let longPressTimeout;
const raycaster = new THREE.Raycaster();  // Créez un raycaster
const intersectedObjects = [];  // Stocker les objets interactifs
let startTime;
let isFilling = false;
const ANIMATION_DURATION = 2000; // Durée pour le clic long (3 secondes)
let prevBone = null;
let score = 0;

export function setupControllers(renderer, scene) {
  let controller = renderer.xr.getController(0);

  // Créer le réticule avec un matériau à opacité modifiable
  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // `selectstart` : Début d'un clic
  controller.addEventListener('selectstart', () => {
    startTime = performance.now();
    isFilling = true;  // Commence à remplir le réticule
    longPressTimeout = setTimeout(() => {
      console.log("Clic long détecté.");
      // Placer le squelette directement après 3 secondes de maintien
      if (reticle && reticle.visible) {
        let mesh = bonesGroup;
        if (mesh) {
          mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
          mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
          reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          mesh.scale.y = Math.random() * 2 + 1;
          mesh.scale.set(0.13, 0.13, 0.13);
          scene.add(mesh);
          console.log("Squelette placé à un nouvel emplacement (clic long automatique).");
        }
      }
      isFilling = false;  // Arrêter le remplissage une fois l'objet placé
    }, ANIMATION_DURATION); // 3 secondes
  });

  // `selectend` : Fin d'un clic
  controller.addEventListener('selectend', () => {
    clearTimeout(longPressTimeout);  // Annuler le timer si le clic est relâché trop tôt
    isFilling = false;  // Arrêter le remplissage si clic court
    reticle.material.opacity = 0.2;  // Réinitialiser le remplissage du réticule

    // Si le clic long n'a pas eu lieu, cela signifie qu'il s'agit d'un clic court
    if (performance.now() - startTime < ANIMATION_DURATION) {
      console.log("Clic court détecté.");
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      // Vérifier les intersections avec les os du squelette
      if (bonesGroup) {
        intersectedObjects.length = 0;  // Réinitialiser le tableau des objets touchés
        raycaster.intersectObjects(scene.children, true, intersectedObjects);

        if (intersectedObjects.length > 0) {
          if (intersectedObjects[0].object.name.includes("qcmButton")) {
            console.log("Bouton QCM sélectionné:", intersectedObjects[0].object.name);
            checkAnswer(intersectedObjects[0].object, prevBone, score, scene);
          }
          else if(intersectedObjects[0].object.name && !intersectedObjects[0].object.material.transparent && intersectedObjects[0].object.text !== "Bonne réponse!") {
            const selectedBone = intersectedObjects[0].object;  // Le premier os touché
            console.log("Os sélectionné:", selectedBone.name);
            selectedBone.material.color.set(0xff0000);
            selectedBone.material.depthTest = false;
            addButtonsAroundBone(selectedBone, scene);
            fillQCMButtons(selectedBone);
            prevBone = selectedBone;
          }
        }
      }
    }
  });

  scene.add(controller);

  // Fonction d'animation pour mettre à jour le remplissage du réticule
  function animate() {
    if (isFilling && reticle.visible) {
      const elapsedTime = performance.now() - startTime;
      const fraction = Math.min(elapsedTime / ANIMATION_DURATION, 1);
      reticle.material.opacity = 0.2 + (0.8 * fraction);  // Remplir progressivement l'opacité de 0.2 à 1
    }
    requestAnimationFrame(animate);
  }
  animate();
}


export { reticle }; // Exporter le reticle pour l'utiliser ailleurs

export function animate(renderer, scene, camera, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
          hitTestSource = source;
        });
      });

      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length) {
        const hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }

  renderer.render(scene, camera);
}

export { score };