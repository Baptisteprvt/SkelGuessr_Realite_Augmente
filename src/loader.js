import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as THREE from 'three';

let successSound;
let wrongSound;
let bonesGroup; // Déclarez la variable au niveau du module
let listener = new THREE.AudioListener();

export function loadSkeleton(scene) {
  const loader = new FBXLoader();
  loader.load('../public/assets/DancingBro.fbx', (object) => {
    if (object) {
      object.scale.set(0.13, 0.13, 0.13);
      object.position.set(0, 0, 0);
      
      bonesGroup = object;
      // Modifier les noms des os
      bonesGroup.children.forEach(bone => {
        bone.name = bone.name.replace(/_/g, ' ');
        let boneName = bone.name.slice(0, -1);
        if (bone.name.endsWith('r')) {
          bone.name = `${boneName} RIGHT`;
        } else if (bone.name.endsWith('l')) {
          bone.name = `${boneName} LEFT`;
        }
      });
      
      //scene.add(bonesGroup);
    }
  }, undefined, (error) => {
    console.error('Erreur lors du chargement du fichier FBX:', error);
  });
}

const audioLoader = new THREE.AudioLoader();

audioLoader.load('../public/assets/correct-6033.mp3', (buffer) => {
    successSound = new THREE.Audio(listener);
    successSound.setBuffer(buffer);
    successSound.setLoop(false);
    successSound.setVolume(0.5);
});

audioLoader.load('../public/assets/wrong-47985.mp3', (buffer) => {
    wrongSound = new THREE.Audio(listener);
    wrongSound.setBuffer(buffer);
    wrongSound.setLoop(false);
    wrongSound.setVolume(0.5);
});



export { bonesGroup, successSound, wrongSound }; // Exporter bonesGroup pour qu'il soit accessible aux autres modules
