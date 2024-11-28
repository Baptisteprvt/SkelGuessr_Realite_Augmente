import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as THREE from 'three';

/*
Variables :
successSound: Son de succès
wrongSound: Son d'erreur
bonesGroup: Squellette 3D
listener: Listener pour les sons
mixer: Mixer pour les animations
audioLoader: Loader pour les sons
*/
let bonesGroup;
let listener = new THREE.AudioListener();
let mixer;
const audioLoader = new THREE.AudioLoader();

//Chargement du squellette
export function loadSkeleton(scene) {
  const loader = new FBXLoader();
  loader.load('/assets/DancingBro.fbx', (object) => {
    if (object) {
      object.scale.set(0.13, 0.13, 0.13);
      object.position.set(0, 0, 0);

      bonesGroup = object;

      bonesGroup.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
        }
      });

      bonesGroup.children.forEach(bone => {
        bone.name = bone.name.replace(/_/g, ' ');
        let boneName = bone.name.slice(0, -1);
        if (bone.name.endsWith('r')) {
          bone.name = `${boneName} RIGHT`;
        } else if (bone.name.endsWith('l')) {
          bone.name = `${boneName} LEFT`;
        }
      });
      mixer = new THREE.AnimationMixer(bonesGroup);
    }
  }, undefined, (error) => {
    console.error('Erreur lors du chargement du fichier FBX:', error);
  });
}

// Charger le son de succès
let successSound = new THREE.PositionalAudio(listener);
audioLoader.load('/assets/correct-6033.mp3', function (buffer) {
    successSound.setBuffer(buffer);
    successSound.setRefDistance(1);
    successSound.setVolume(0.5);
});

// Charger le son d'erreur
let wrongSound = new THREE.PositionalAudio(listener);
audioLoader.load('/assets/wrong-47985.mp3', function (buffer) {
    wrongSound.setBuffer(buffer);
    wrongSound.setRefDistance(1);
    wrongSound.setVolume(0.5);
});


//Export des variables
export { bonesGroup, successSound, wrongSound, mixer, listener };
