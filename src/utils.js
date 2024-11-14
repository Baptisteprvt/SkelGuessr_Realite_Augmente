import { bonesGroup } from './loader.js';
import { bonesOrder, selectedBoneIndex } from './main.js';
import { triggerSuccessAnimation, triggerExplosionAnimation } from './animations.js';
import {score} from './controllers.js';
import * as THREE from 'three';

let buttonMeshes = [];
let lineMeshes = [];

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function generateBonesOrder() {
    bonesOrder = [...Array(bonesGroup.children.length).keys()];
    bonesOrder = shuffleArray(bonesOrder);
    selectedBoneIndex = 0;
};

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
  
  //Calculer la position relative des boutons par rapport a l'orientation (Faire un calcul trigonometrique pour que les boutons soient autour de l'os sur un plan face au squelette)
  let positions = [
    new THREE.Vector3(x, y, z).applyQuaternion(rotation),
    new THREE.Vector3(-x, y, z).applyQuaternion(rotation),
    new THREE.Vector3(x, -y, z).applyQuaternion(rotation),
    new THREE.Vector3(-x, -y, z).applyQuaternion(rotation)
  ];
  
  const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const buttonGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.05); // Représente un bouton
  let i = 0;
  positions.forEach(position => {
    // Calculer la position relative en fonction du centre de l'os
    const buttonPosition = boneCenter.clone().add(position);

    // Créer et positionner le bouton
    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial.clone());
    buttonMesh.name = `qcmButton${i}`;
    buttonMesh.position.copy(buttonPosition);
    
    // Appliquer la même rotation que l'os
    buttonMesh.quaternion.copy(bonesGroup.quaternion);
    
    // Ajouter le bouton à la scène
    scene.add(buttonMesh);
    buttonMeshes.push(buttonMesh);

    // Ajouter une ligne reliant le bouton à l'os
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [boneCenter, buttonMesh.position];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(lineMesh);
    lineMeshes.push(lineMesh);
    i++;
  });
}

export function removeButtonsAndLines(scene, prevBone, currentBone) {
  // Supprimer les anciens boutons
  buttonMeshes.forEach(button => {
    scene.remove(button);
    button.geometry.dispose();
    button.material.dispose();
  });
  buttonMeshes.length = 0;

  // Supprimer les anciennes lignes
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

function createTextTexture(text) {
  text = text.toUpperCase();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.font = 'bold 20px Arial';
  //retour a la ligne si le texte est trop long
  if (text.length > 36) {
      //baisser la police et separer en deux a l'espace le plus proche a gauche
      context.font = 'bold 15px Arial';
      let text1 = text.substring(0, text.lastIndexOf(' ', 20));
      let text2 = text.substring(text.lastIndexOf(' ', 20) + 1);
      context.fillText(text1, 10, 25);
      context.fillText(text2, 10, 55);
  }
  else if (text.length > 18) {
      //separer en deux a l'espace le plus proche a gauche
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

function updateButtonLabels(labels) {
  buttonMeshes.forEach((buttonMesh, index) => {
      const textTexture = createTextTexture(labels[index]);
      buttonMesh.material.map = textTexture;
      buttonMesh.material.needsUpdate = true;
      buttonMesh.name += labels[index];
  });
}

export function fillQCMButtons(CurrentBone) {
  if (!CurrentBone) return;

  const correctAnswer = CurrentBone.name;

  // Sélectionner 3 autres os aléatoires pour les réponses
  let otherBones = bonesGroup.children.filter(bone => bone !== CurrentBone);
  otherBones = otherBones.sort(() => 0.5 - Math.random()).slice(0, 3);

  const otherAnswers = otherBones
      .filter(bone => bone.geometry && bone.name !== correctAnswer && bone.name !== undefined)
      .map(bone => bone.name);

  // Mélanger la bonne réponse avec les 3 autres
  const allAnswers = [correctAnswer, ...otherAnswers].sort(() => 0.5 - Math.random());
  updateButtonLabels(allAnswers);
};

export function checkAnswer(button, previousBone, score, scene)
{
  if (!previousBone) return;

  const correctAnswer = previousBone.name;
  const userAnswer = button.name;

  console.log('Bonne réponse:', correctAnswer);
  console.log('Votre réponse:', userAnswer);

  if (userAnswer.includes(correctAnswer)) {
      console.log('Bonne réponse!');
      score++;
      triggerSuccessAnimation(previousBone);
      removeButtonsAndLines(scene, previousBone, null);
      document.getElementById('score').innerHTML = `Score: ${score}`;
  } else {
      console.log('Mauvaise réponse! La bonne réponse était:', correctAnswer);
      console.log('Votre réponse était:', userAnswer);
      triggerExplosionAnimation(previousBone);
      removeButtonsAndLines(scene, previousBone, null);
      document.getElementById('score').innerHTML = `Score: ${score}`;
  }
};
