import * as THREE from 'three'; 
import { scene } from './setup.js';
import { getBoneBoundingBoxCenter } from './utils.js';
import { successSound, wrongSound } from './loader.js';

const world = new CANNON.World();
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.gravity.set(0, -2, 0);
world.addBody(groundBody);
let elements = [];


export function triggerSuccessAnimation(bone) {
    if (!bone) return;

    // Jouer le son de succès
    if (successSound) {
        successSound.play();
    }

    let startTime = performance.now();
    const duration = 1000; // Durée d'animation en millisecondes (1 seconde)

    const animateBone = () => {
        const elapsedTime = performance.now() - startTime;

        if (elapsedTime < duration) {
            const greenValue = Math.sin(elapsedTime / 100 * Math.PI * 2) * 0.5 + 0.5;
            bone.material.color.setRGB(0, greenValue, 0); // Osciller en vert
            bone.material.emissive.setRGB(0, greenValue, 0);
            bone.material.emissiveIntensity = 0.5;

            requestAnimationFrame(animateBone);

        }
    };

    requestAnimationFrame(animateBone);
    bone.text = "Bonne réponse!";
};

const removeOldElements = () => {
    for (let i = 0; i < 10; i++) {
        const oldestElement = elements.shift();
        if (oldestElement) {
            scene.remove(oldestElement.mesh);
            world.removeBody(oldestElement.body);
        }
    }
};

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
        wrongSound.play();
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
