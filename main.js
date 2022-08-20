// import 'style.css'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
// import { PointLightHelper } from 'three';


let camera, scene, renderer;
let name, aboutme, experience, contact;
let glass, metalglass, cloud;
let loader, clock;

var aboutmeRotateFactor = 0;
var experienceRotateFactor = 0;
var contactRotateFactor = 0;


let aboutmeSpinstart;
let contactSpinstart;
let experienceSpinstart;


var abmposx = -6.5;
var abmposy = -7;
var abmposz = 20;
var raycaster, mouse;

const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')
var modal;

const loadingManager = new THREE.LoadingManager();


const params = {
    color: 0xffffff,
    transmission: 1,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 1.5,
    thickness: 0.01,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: 1,
    lightIntensity: 1,
    exposure: 1
};

init();
document.body.onscroll = actOnScroll;
animate();

function init() {
    //scene, background, aspect ratios
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader(/*loadingManager*/)
        .setPath(' sky/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setX(30);
    camera.position.setY(2);

    init_materials();
    init_lights();

    loader = new GLTFLoader(loadingManager);
    init_objects();
    init_controls();
    clock = new THREE.Clock();
    clock.start();

    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', onClick);

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal')
            closeModal(modal)
        })
    })

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
    })
    window.addEventListener( 'resize', onWindowResize );
    
    const progressBar = document.getElementById("progress-bar");
    loadingManager.onProgress = function(url,loaded,total){
        progressBar.value = (loaded/total)*100;
        console.log((loaded/total))
    }

    const loadingScreen = document.querySelector('.loading-screen');
    loadingManager.onLoad = function(){
        loadingScreen.style.display = "none";
        console.log('Finished loading!')
    }
    mouse = new THREE.Vector2();
}

function init_materials() {
    // glass material
    const glassCube = new THREE.CubeTextureLoader(/*loadingManager*/)
        .setPath('sky/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
    // .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
    glassCube.mapping = THREE.CubeRefractionMapping;

    glass = new THREE.MeshPhysicalMaterial({
        // color: params.color,
        color: 0xe6edf0,
        metalness: params.metalness,
        roughness: params.roughness,
        ior: params.ior,
        envMap: glassCube,
        envMapIntensity: params.envMapIntensity,
        transmission: params.transmission, // use material.transmission for glass materials
        specularIntensity: params.specularIntensity,
        specularColor: params.specularColor,
        opacity: params.opacity,
        side: THREE.DoubleSide,
        transparent: true
    });

    //metal
    const metalGlassCube = new THREE.CubeTextureLoader(/*loadingManager*/)
        .setPath('sky/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
    // .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);

    metalglass = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        envMap: metalGlassCube,
        thickness: 0.5,
        transmission: 0
    });

    // var cloudsAlpha = loader.load("alphamap.png")
    cloud = new THREE.MeshPhysicalMaterial({
        color: 0x6f7070,
        emissive: 0x6f7070,
        metalness: 0.8,
        roughness: 100,
        reflectivity: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 1
    });
}

function init_lights() {
    // const pointLight = new THREE.PointLight(0xf58ef1, 0.3);
    // pointLight.position.set(100, -100, -100);
    // scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffffbb, 0.3);
    pointLight2.position.set(100, 100, -100);
    scene.add(pointLight2);

    const light = new THREE.HemisphereLight(0xffffbb, 0x1b2529, 0.5);
    scene.add(light);

    const pointLight3 = new THREE.PointLight(0xffffbb, 0.6);
    pointLight3.position.set(20, 20, 10);
    scene.add(pointLight3);

    // const lightHelper = new THREE.PointLightHelper(pointLight3);
    // scene.add(lightHelper);

    const ambientLight = new THREE.AmbientLight(0xf58ef1, 0.4);
    scene.add(ambientLight);
}

function init_objects() {
    init_name();
    init_aboutme();
    init_experience();
    init_contact();

}

function init_name() {
    loader.load(
        'glb/name.glb',
        function (gltf) {
            name = gltf.scene;
            name.position.x = - 10;
            name.position.y = 6;
            name.traverse((o) => {
                if (o.isMesh) o.material = metalglass;
            });
            scene.add(name);
        },
        function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
        function (error) { console.log('An error happened'); }
    );
}

function init_aboutme() {
    loader.load(
        'glb/plusaboutme.glb',
        function (gltf) {
            aboutme = gltf.scene;
            aboutme.position.x = abmposx - 3.5;
            aboutme.position.y = abmposy - 2;
            aboutme.position.z = abmposz;

            aboutme.rotation.x = 0.2;

            aboutme.children[1].traverse((o) => {
                if (o.isMesh) o.material = metalglass;
            });
            aboutme.children[0].traverse((o) => {
                if (o.isMesh) o.material = glass;
            });
            scene.add(aboutme);
            console.log('About me added');
        },
        function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
        function (error) {
            console.log('An error happened');

        });
}

function init_experience() {
    loader.load(
        'glb/cloudexperience.glb',
        function (gltf) {
            experience = gltf.scene;
            experience.position.x = abmposx - 3.5;
            experience.position.y = abmposy - 3;
            experience.position.z = abmposz - 20;

            experience.rotation.y = -0.05;

            experience.children[0].traverse((o) => {
                if (o.isMesh) o.material = metalglass;
            });
            experience.children[1].traverse((o) => {
                if (o.isMesh) o.material = glass;
            });
            scene.add(experience);
        },
        function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
        function (error) {
            console.log('An error happened');

        });
}

function init_contact() {
    loader.load(
        'glb/phonecontact.glb',
        function (gltf) {
            contact = gltf.scene;
            contact.position.x = abmposx - 3.5;
            contact.position.y = abmposy;
            contact.position.z = abmposz - 40;
            // aboutme.rotation.y = 0.4;

            contact.children[0].traverse((o) => {
                if (o.isMesh) o.material = glass;
            });
            contact.children[1].traverse((o) => {
                if (o.isMesh) o.material = metalglass;
            });

            scene.add(contact);
        },
        function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
        function (error) {
            console.log('An error happened');

        });
}

function init_controls() {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = true;

    controls.keys = {
        LEFT: 'ArrowLeft', //left arrow
        UP: 'ArrowUp', // up arrow
        RIGHT: 'ArrowRight', // right arrow
        BOTTOM: 'ArrowDown' // down arrow
    }
}

function animate() {
    requestAnimationFrame(animate);

    name.rotation.y = 0.1 * Math.cos(clock.getElapsedTime());

    floatBubble();
    spinWhenClicked();
    render();
}

function floatBubble() {
    var increment = 0.003 * Math.sin(clock.getElapsedTime());
    aboutme.children[0].position.y += increment;
    aboutme.children[1].position.y -= 0.8 * increment;

    experience.children[0].position.y += increment;
    experience.children[1].position.y -= 0.8 * increment;

    contact.children[0].position.y += increment;
    contact.children[1].position.y -= 0.8 * increment;
}

function spinWhenClicked() {
    aboutme.rotation.y += aboutmeRotateFactor;
    experience.rotation.y += experienceRotateFactor;
    contact.rotation.y += contactRotateFactor;

    if (clock.getElapsedTime() - aboutmeSpinstart > 0.5) {
        aboutme.rotation.y = 0;
        aboutmeRotateFactor = 0;
    }
    if (clock.getElapsedTime() - experienceSpinstart > 0.5) {
        experience.rotation.y = 0;
        experienceRotateFactor = 0;
    }
    if (clock.getElapsedTime() - contactSpinstart > 0.5) {
        contact.rotation.y = 0;
        contactRotateFactor = 0;
    }
}

function render() {
    renderer.render(scene, camera)
}

function actOnScroll() {
    const t = document.body.getBoundingClientRect().top;
    aboutme.rotation.y += 0.3;
    experience.rotation.y += 0.3;
    contact.rotation.y += 0.3;

}

function onClick() {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersect = intersects[0].object;
        // intersect.rotation.z += Math.PI;
        console.log('Intersection:', intersect);

        if (intersect.id == aboutme.children[0].id || intersect.id == aboutme.children[1].id) {
            console.log("aboutme");
            aboutmeRotateFactor = 5;
            aboutmeSpinstart = clock.getElapsedTime();
            modal = document.getElementById("about-me")
        }
        else if (intersect.id == contact.children[0].id || intersect.id == contact.children[1].id) {
            console.log("contact");
            contactRotateFactor = 5;
            contactSpinstart = clock.getElapsedTime();
            modal = document.getElementById("contact")
        }
        else if (intersect.id == experience.children[0].id || intersect.id == experience.children[1].id) {
            console.log("experience");
            experienceRotateFactor = 5;
            experienceSpinstart = clock.getElapsedTime();
            modal = document.getElementById("experience")
        }
        openModal(modal);

    }

}

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
//     overlay.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
//     overlay.classList.remove('active')
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
