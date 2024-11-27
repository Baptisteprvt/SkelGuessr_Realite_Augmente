import { bonesGroup } from './loader.js';
import { bonesOrder, selectedBoneIndex } from './main.js';
import { triggerSuccessAnimation, triggerExplosionAnimation } from './animations.js';
import * as THREE from 'three';

/*
Variables :
buttonMeshes: Liste des boutons
lineMeshes: Liste des lignes
scorePlane: Plan pour afficher le score
score: Score
*/
let buttonMeshes = [];
let lineMeshes = [];
let scorePlane;
let score = 0;

//Fonction pour créer un affichage de score
export function createScoreDisplay(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.font = 'bold 50px Arial';
    context.fillText('Score: 0', 50, 150);
    const texture = new THREE.CanvasTexture(canvas);

    const scoreMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const scoreGeometry = new THREE.PlaneGeometry(1.5, 0.75);
    scorePlane = new THREE.Mesh(scoreGeometry, scoreMaterial);
    scorePlane.name = 'scorePlane';
    
    scorePlane.position.set(0, 1.5, -2);
    scene.add(scorePlane);
}

//Fonction pour mettre à jour l'affichage du score
export function updateScoreDisplay(score) {
    if (scorePlane) {
        const context = scorePlane.material.map.image.getContext('2d');
        context.clearRect(0, 0, 512, 256);
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.fillRect(0, 0, 512, 256);
        context.fillStyle = 'black';
        context.font = 'bold 50px Arial';
        context.fillText(`Score: ${score}`, 50, 150);
        scorePlane.material.map.needsUpdate = true;
    }
}

//Fonction pour mélanger la liste des os
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

//Fonction pour générer l'ordre des os
export function generateBonesOrder() {
    bonesOrder = [...Array(bonesGroup.children.length).keys()];
    bonesOrder = shuffleArray(bonesOrder);
    selectedBoneIndex = 0;
};

//Fonction pour ajouter des boutons autour de l'os
export function addButtonsAroundBone(bone, scene) {
  const boneCenter = getBoneBoundingBoxCenter(bone);
  if (!boneCenter) {
    console.error("Impossible de déterminer le centre de l'os.");
    return;
  }

  let rotation = bonesGroup.quaternion.clone();
  let x = 0.3;
  let y = 0.3;
  let z = 0.3;

  let positions = [
    new THREE.Vector3(x, y, z).applyQuaternion(rotation),
    new THREE.Vector3(-x, y, z).applyQuaternion(rotation),
    new THREE.Vector3(x, -y, z).applyQuaternion(rotation),
    new THREE.Vector3(-x, -y, z).applyQuaternion(rotation)
  ];

  const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const buttonGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.05);
  let i = 0;
  
  positions.forEach(position => {
    const buttonPosition = boneCenter.clone().add(position);

    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial.clone());
    buttonMesh.name = `qcmButton${i}`;
    buttonMesh.position.copy(buttonPosition);

    buttonMesh.quaternion.copy(bonesGroup.quaternion);
    
    buttonMesh.scale.set(0, 0, 0);

    scene.add(buttonMesh);
    buttonMeshes.push(buttonMesh);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [boneCenter, buttonMesh.position];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(lineMesh);
    lineMeshes.push(lineMesh);

    new TWEEN.Tween(buttonMesh.scale)
      .to({ x: 1, y: 1, z: 1 }, 1000)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();

    i++;
  });
}

//Fonction pour supprimer les boutons et les lignes après une réponse
export function removeButtonsAndLines(scene, prevBone, currentBone) {
  buttonMeshes.forEach(button => {
    scene.remove(button);
    button.geometry.dispose();
    button.material.dispose();
  });
  buttonMeshes.length = 0;

  lineMeshes.forEach(line => {
    scene.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  });
  lineMeshes.length = 0;
  
  if(prevBone && currentBone)
  {
    let bonecolor = currentBone.material.color;
    prevBone.material.color.set(bonecolor);
  }
}

//Fonction pour obtenir le centre de la boîte englobante de l'os
export function getBoneBoundingBoxCenter(bone) {
  if (!bone.geometry) {
    console.error("L'os n'a pas de géométrie définie.");
    return new THREE.Vector3(0, 0, 0);
  }

  bone.geometry.computeBoundingBox();
  const boundingBox = bone.geometry.boundingBox;
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  bone.localToWorld(center);

  return center;
}

//Fonction pour créer une texture de texte et afficher les noms d'os sur les boutons
function createTextTexture(text) {
  if(!text) return;
  text = text.toUpperCase();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.font = 'bold 20px Arial';
  if (text.length > 36) {
      context.font = 'bold 15px Arial';
      let text1 = text.substring(0, text.lastIndexOf(' ', 20));
      let text2 = text.substring(text.lastIndexOf(' ', 20) + 1);
      context.fillText(text1, 10, 25);
      context.fillText(text2, 10, 55);
  }
  else if (text.length > 18) {
      let text1 = text.substring(0, text.lastIndexOf(' ', 18));
      let text2 = text.substring(text.lastIndexOf(' ', 18) + 1);
      context.fillText(text1, 10, 25);
      context.fillText(text2, 10, 55);
  }
  else {
      context.fillText(text, 10, 40);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

//Fonction pour mettre à jour les étiquettes des boutons
function updateButtonLabels(labels) {
  buttonMeshes.forEach((buttonMesh, index) => {
      const textTexture = createTextTexture(labels[index]);
      buttonMesh.material.map = textTexture;
      buttonMesh.material.needsUpdate = true;
      buttonMesh.name += labels[index];
  });
}

//Fonction pour remplir les boutons QCM
export function fillQCMButtons(CurrentBone) {
  if (!CurrentBone) return;

  const correctAnswer = CurrentBone.name;

  let otherBones = bonesGroup.children.filter(bone => bone !== CurrentBone);
  otherBones = otherBones.sort(() => 0.5 - Math.random()).slice(0, 3);

  const otherAnswers = otherBones
      .filter(bone => bone.geometry && bone.name !== correctAnswer && bone.name !== undefined && bone.name !== "" && bone.name !== null)
      .map(bone => bone.name);

  const allAnswers = [correctAnswer, ...otherAnswers].sort(() => 0.5 - Math.random());
  updateButtonLabels(allAnswers);
};

//Fonction pour vérifier la réponse de l'utilisateur
export function checkAnswer(button, previousBone, scene)
{
  if (!previousBone) return;

  const correctAnswer = previousBone.name;
  const userAnswer = button.name;

  if (userAnswer.includes(correctAnswer)) {
      console.log('Bonne réponse!');
      score++;
      console.log('Score:', score);
      triggerSuccessAnimation(previousBone);
      removeButtonsAndLines(scene, previousBone, null);
      updateScoreDisplay(score);
  } else {
      console.log('Mauvaise réponse! La bonne réponse était:', correctAnswer);
      console.log('Votre réponse était:', userAnswer);
      triggerExplosionAnimation(previousBone);
      removeButtonsAndLines(scene, previousBone, null);
  }
};
