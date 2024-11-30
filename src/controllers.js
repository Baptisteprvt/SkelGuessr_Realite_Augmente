import * as THREE from 'three';
import { bonesGroup, mixer } from './loader.js';
import { addButtonsAroundBone, removeButtonsAndLines, fillQCMButtons, checkAnswer } from './utils.js';
import { playAnimation, stopAnimation } from './animations.js';

/*
Variables :
hitTestSourceRequested: Booléen pour savoir si la source de test de collision est demandée
hitTestSource: Source de test de collision
reticle: Réticule pour placer le squelette
longPressTimeout: Timeout pour le long appui
raycaster: Raycaster pour les collisions
intersectedObjects: Liste des objets intersectés
startTime: Temps du début de l'appui
isFilling: Booléen pour savoir si le remplissage est en cours
ANIMATION_DURATION: Durée necessaire pour remplir le réticule
prevBone: Os précédemment sélectionné
dragging: Booléen pour savoir si l'objet est en train d'être déplacé
dragObject: Objet en train d'être déplacé
longPressActive: Booléen pour savoir si le long appui est actif
clickCount: Nombre de clics
firstClickTime: Temps du premier clic
CLICK_THRESHOLD: Seuil de clics
TIME_LIMIT: Limite de temps pour faire 5 clics pour déclencher un événement spécial
clock: Horloge pour le temps
playing: Booléen pour savoir si l'animation est en cours
*/
let hitTestSourceRequested = false;
let hitTestSource = null;
let reticle;
let longPressTimeout;
const raycaster = new THREE.Raycaster();
const intersectedObjects = [];
let startTime;
let isFilling = false;
const ANIMATION_DURATION = 2000;
let prevBone = null;
let dragging = false;
let dragObject = null;
let longPressActive = false;
let clickCount = 0;
let firstClickTime = 0;
const CLICK_THRESHOLD = 5;
let clock = new THREE.Clock();
let playing = false;

//Fonction pour initialiser les contrôleurs
export function setupControllers(renderer, scene) {
  let controller = renderer.xr.getController(0);

  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  controller.addEventListener('selectstart', () => {
    if (dragging) return;

    const currentTime = performance.now();
    if (clickCount === 0) {
      firstClickTime = currentTime;
    }

    if (currentTime - firstClickTime <= ANIMATION_DURATION) {
      clickCount++;
    } else {
      clickCount = 1;
      firstClickTime = currentTime;
    }

    if (clickCount >= CLICK_THRESHOLD) {
      triggerSpecialEvent();
      clickCount = 0;
    }

    startTime = performance.now();
    isFilling = true;

    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    intersectedObjects.length = 0;
    raycaster.intersectObjects(scene.children, true, intersectedObjects);

    if (intersectedObjects.length > 0 && intersectedObjects[0].object.name !== 'shadowFloor') {
      const selectedObject = intersectedObjects[0].object;
      if (selectedObject.name === 'scorePlane') {
        dragging = true;
        dragObject = selectedObject;
      }
    } else {
      longPressTimeout = setTimeout(() => {
        longPressActive = true;
        removeButtonsAndLines(scene);
        if (reticle && reticle.visible) {
          let mesh = bonesGroup;
          if (mesh) {
            mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
            mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
            reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
            mesh.scale.set(0.13, 0.13, 0.13);
            scene.add(mesh);
          }
        }
        isFilling = false;
      }, ANIMATION_DURATION);
    }
  });

  controller.addEventListener('selectend', () => {
    clearTimeout(longPressTimeout);
    isFilling = false;
    reticle.material.opacity = 0.2;

    if (dragging) {
      dragging = false;
      dragObject = null;
    } else if (longPressActive) {
      longPressActive = false;
    } else if (performance.now() - startTime < ANIMATION_DURATION) {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      if (bonesGroup) {
        intersectedObjects.length = 0;
        raycaster.intersectObjects(scene.children, true, intersectedObjects);

        if (intersectedObjects.length > 0) {
          if (intersectedObjects[0].object.name.includes("qcmButton")) {
            console.log("Bouton QCM sélectionné:", intersectedObjects[0].object.name);
            checkAnswer(intersectedObjects[0].object, prevBone, scene);
          } else if (intersectedObjects[0].object.name && !intersectedObjects[0].object.material.transparent && intersectedObjects[0].object.text !== "Bonne réponse!") {
            const selectedBone = intersectedObjects[0].object;
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

  function animate() {
    if (dragging && dragObject) {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;
        dragObject.position.copy(intersectPoint);
      }
    }
    if (isFilling && reticle.visible) {
      const elapsedTime = performance.now() - startTime;
      const fraction = Math.min(elapsedTime / ANIMATION_DURATION, 1);
      reticle.material.opacity = 0.2 + (0.8 * fraction);
    }
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    requestAnimationFrame(animate);
  }
  animate();
}

export { reticle };

//Fonction pour animer les contrôleurs
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
  TWEEN.update();
  renderer.render(scene, camera);
}

//Fonction pour déclencher un événement spécial (danse)
function triggerSpecialEvent() {
  if (!playing) {
    playAnimation(bonesGroup);
    playing = true;
  }
  else {
    stopAnimation();
    playing = false;
  }
}