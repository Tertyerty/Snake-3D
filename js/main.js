var renderer = 0;
var scene = 0;
var camera = 0;
const VIEWPORT = { width: 0, height: 0, aspect: 0 };
  

function start(){
    VIEWPORT.width = window.innerWidth;
    VIEWPORT.height = window.innerHeight;
    VIEWPORT.aspect = VIEWPORT.width / VIEWPORT.height;
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(VIEWPORT.width, VIEWPORT.height);
    $('#canvas-section').append(renderer.domElement);

    renderer.setClearColor(new THREE.Color(0x0));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, VIEWPORT.aspect, 0.1, 100);
    camera.position.z = 4;


    let boxGeo = new THREE.BoxGeometry(1, 1, 1);
    let boxMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00F0F0)
    });

    let box = new THREE.Mesh(boxGeo, boxMaterial);
    

    scene.add(box);

    animationLoop(updateAndRender);
}


function updateAndRender(dt){
    windowSizeChanged(OnWindowResized);

    renderer.render(scene, camera);
}

function OnWindowResized(width, height){
    VIEWPORT.width = window.innerWidth;
    VIEWPORT.height = window.innerHeight;
    VIEWPORT.aspect = VIEWPORT.width / VIEWPORT.height;
    renderer.setSize(VIEWPORT.width, VIEWPORT.height);
    camera.aspect = VIEWPORT.aspect;
    camera.updateProjectionMatrix();

}


function windowSizeChanged(callback) {
    if (VIEWPORT.width != window.innerWidth || VIEWPORT.height != window.innerHeight) {
        callback(window.innerWidth, window.innerHeight);
    }
}

function animationLoop(callback){
    let past = 0;
    function _animationLoop(now) {
        let deltaTime = now - past;
        deltaTime = deltaTime * 0.001;
        past = now;
        callback(deltaTime);
        requestAnimationFrame(_animationLoop);
    }    
    requestAnimationFrame(_animationLoop);
}

$(document).ready(start);