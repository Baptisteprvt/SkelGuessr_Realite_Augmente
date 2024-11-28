import * as THREE from 'three'; 
import { scene } from './setup.js';
import { getBoneBoundingBoxCenter } from './utils.js';
import { successSound, wrongSound } from './loader.js';
import {mixer, listener} from './loader.js';


/*
Variables :
world: Monde physique
groundShape: Forme du sol
groundBody: Corps du sol
elements: Liste des éléments à supprimer
*/
const world = new CANNON.World();
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.gravity.set(0, -2, 0);
world.addBody(groundBody);
let elements = [];

//Fonction pour déclencher l'animation de succès
export function triggerSuccessAnimation(bone) {
    if (!bone) return;

    if (successSound) {
        if (!bone.successSound) {
            bone.successSound = new THREE.PositionalAudio(listener);
            bone.add(bone.successSound);
            bone.successSound.setBuffer(successSound.buffer);
            bone.successSound.setRefDistance(1);
            bone.successSound.setVolume(0.5);
        }
    
        bone.successSound.play();
    }

    let startTime = performance.now();
    const duration = 1000;

    const animateBone = () => {
        const elapsedTime = performance.now() - startTime;

        if (elapsedTime < duration) {
            const greenValue = Math.sin(elapsedTime / 100 * Math.PI * 2) * 0.5 + 0.5;
            bone.material.color.setRGB(0, greenValue, 0);
            bone.material.emissive.setRGB(0, greenValue, 0);
            bone.material.emissiveIntensity = 0.5;

            requestAnimationFrame(animateBone);

        }
    };

    requestAnimationFrame(animateBone);
    bone.text = "Bonne réponse!";
};

//Fonction pour supprimer les morceaux d'os pour ne pas surcharger la scène
const removeOldElements = () => {
    for (let i = 0; i < 10; i++) {
        const oldestElement = elements.shift();
        if (oldestElement) {
            scene.remove(oldestElement.mesh);
            world.removeBody(oldestElement.body);
        }
    }
};

//Fonction pour créer un morceau d'os physique
const createPhysicalPiece = (piece, vecSize) => {
    const pieceShape = new CANNON.Box(vecSize);
    const pieceBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(piece.position.x, piece.position.y, piece.position.z),
        shape: pieceShape
    });

    world.addBody(pieceBody);
    return pieceBody;
};

//Fonction pour déclencher l'animation d'explosion
export function triggerExplosionAnimation(bone)
{
    const numPieces = 10;
    const explosionForce = 1;
    const bonePosition = new THREE.Vector3();
    bonePosition.copy(getBoneBoundingBoxCenter(bone));

    const pieces = [];
    const pieceSize = 0.05;

    bone.visible = false;
    bone.material.transparent = true;

    if (wrongSound) {
        if (!bone.wrongSound) {
            bone.wrongSound = new THREE.PositionalAudio(listener);
            bone.add(bone.wrongSound);
            bone.wrongSound.setBuffer(wrongSound.buffer);
            bone.wrongSound.setRefDistance(1);
            bone.wrongSound.setVolume(0.5);
        }

        bone.wrongSound.play();
    }

    for (let i = 0; i < numPieces; i++) {
        const vecSize = new CANNON.Vec3(Math.random() * pieceSize, Math.random() * pieceSize, Math.random() * pieceSize);
        const geometry = new THREE.BoxGeometry(vecSize.x, vecSize.y, vecSize.z);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const piece = new THREE.Mesh(geometry, material);
        piece.position.copy(bonePosition);
        scene.add(piece);

        // Corps physique pour chaque morceau
        const pieceBody = createPhysicalPiece(piece, vecSize);

        const force = new CANNON.Vec3(
            (Math.random() - 0.5) * explosionForce,
            (Math.random() - 0.5) * explosionForce,
            (Math.random() - 0.5) * explosionForce
        );
        pieceBody.applyImpulse(force, pieceBody.position);

        pieces.push({ mesh: piece, body: pieceBody });
    }

    elements.push(...pieces);

    if (elements.length > 150) {
        removeOldElements();
    }

    const animatePieces = () => {
        pieces.forEach((piece) => {
            piece.mesh.position.copy(piece.body.position);
            piece.mesh.quaternion.copy(piece.body.quaternion);
        });

        world.step(1 / 60);
        requestAnimationFrame(animatePieces);
    };

    animatePieces();
};

//Fonction pour déclencher l'animation de danse
export function playAnimation(bonesGroup) {
    if (mixer) {
        const action = mixer.clipAction(bonesGroup.animations[0]);
        action.play();
    }
    else {
        console.error('Le mixer n\'a pas été défini.');
    }
}

//Fonction pour arrêter l'animation de danse
export function stopAnimation() {
    if (mixer) {
        mixer.stopAllAction();
    }
    else {
        console.error('Le mixer n\'a pas été défini.');
    }
}