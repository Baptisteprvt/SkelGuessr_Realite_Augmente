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
let successSound;
let wrongSound;
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

//Chargement des sons
audioLoader.load('/assets/correct-6033.mp3', (buffer) => {
    successSound = new THREE.Audio(listener);
    successSound.setBuffer(buffer);
    successSound.setLoop(false);
    successSound.setVolume(0.5);
});

audioLoader.load('/assets/wrong-47985.mp3', (buffer) => {
    wrongSound = new THREE.Audio(listener);
    wrongSound.setBuffer(buffer);
    wrongSound.setLoop(false);
    wrongSound.setVolume(0.5);
});


//Export des variables
export { bonesGroup, successSound, wrongSound, mixer };
