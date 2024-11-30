import { XRButton } from 'three/addons/webxr/XRButton.js';
import {
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    DirectionalLight,
    PlaneGeometry,
    ShadowMaterial,
    Mesh
} from 'three';

// Créer une scène 3D
const scene = new Scene();

// Fonction pour configurer WebXR
export async function setupXR(renderer) {
    document.body.appendChild(XRButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
    }));

    // Attendre la création de la session XR
    await new Promise((resolve) => {
        renderer.xr.addEventListener('sessionstart', resolve);
    });
}

// Fonction pour initialiser la scène
export function initScene() {

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new PerspectiveCamera(75, aspect, 0.1, 10);
    camera.position.set(0, 1.6, 3);

    const dirLight = new DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const hemiLight = new HemisphereLight(0xffffff, 0xbbbbff, 3);
    hemiLight.position.set(0.5, 1, 0.25);
    scene.add(hemiLight);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    const floorGeometry = new PlaneGeometry(6, 6);
    const floorMaterial = new ShadowMaterial({ opacity: 0.25 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;  // Placez le plan légèrement en dessous
    floor.receiveShadow = true;
    floor.name = 'shadowFloor';  // Donner un nom spécifique au plan de sol
    scene.add(floor);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

export { scene }; // Export de la scène et du monde pour les utiliser ailleurs