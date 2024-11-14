import { XRButton } from 'three/addons/webxr/XRButton.js';
import {
    AmbientLight,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from 'three';

const scene = new Scene();

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

export function initScene() {

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new PerspectiveCamera(75, aspect, 0.1, 10);
    camera.position.set(0, 1.6, 3);

    const light = new AmbientLight(0xffffff, 1.0);
    scene.add(light);

    const hemiLight = new HemisphereLight(0xffffff, 0xbbbbff, 3);
    hemiLight.position.set(0.5, 1, 0.25);
    scene.add(hemiLight);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

export { scene }; // Exporter la scène et le monde pour les utiliser ailleurs