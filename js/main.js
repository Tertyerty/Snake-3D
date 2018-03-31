var renderer = 0;
var scene = 0;
var camera = 0;
var keys = [];
const VIEWPORT = { 
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: function(){
        return this.width / this.height;
    },
    ortho:{
        max: 20,
        left: () => { return -0.5 * VIEWPORT.aspect() * VIEWPORT.ortho.max },
        right: () => { return 0.5 * VIEWPORT.aspect() * VIEWPORT.ortho.max },
        top: () => { return 0.5 * VIEWPORT.ortho.max },
        bottom: () => { return -0.5 * VIEWPORT.ortho.max }
    },
    near: 0.1,
    far: 2000,
    mode: 'ORTHO'
};

let snake = 0;

function start(){
    /*
    VIEWPORT.width = window.innerWidth;
    VIEWPORT.height = window.innerHeight;
    */
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(VIEWPORT.width, VIEWPORT.height);
    $('#canvas-section').append(renderer.domElement);

    renderer.setClearColor(new THREE.Color(0x0));

    scene = new THREE.Scene();
    if(VIEWPORT.mode == 'PERSPECTIVE')
        camera = new THREE.PerspectiveCamera(45, VIEWPORT.aspect(), VIEWPORT.near, VIEWPORT.far);
    else if(VIEWPORT.mode == 'ORTHO')
        camera = new THREE.OrthographicCamera(VIEWPORT.ortho.left(), VIEWPORT.ortho.right(), VIEWPORT.ortho.top(), VIEWPORT.ortho.bottom(), VIEWPORT.near, VIEWPORT.far);

    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    //camera.position.set(0, 0, 100);

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    let xDirLight = new THREE.DirectionalLight(0xff0000, 1.0);
    let yDirLight = new THREE.DirectionalLight(0x00ff00, 1.0);
    let zDirLight = new THREE.DirectionalLight(0x0000ff, 1.0);
    xDirLight.position.set(1, 0, 0)
    yDirLight.position.set(0, 1, 0)
    zDirLight.position.set(0, 0, 1)

    let boxGeo = new THREE.BoxGeometry(1, 1, 1);
    let boxMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0xFFFFFF)
    });
    
    window.addEventListener("resize", () => { windowSizeChanged(renderer, camera) });

    snake = new Snake( {
        position: new THREE.Vector3(0, 0.5, 0),
        speed: 0.5,
    }, scene );

    let gridHelper = new THREE.GridHelper(21, 21);

    scene.add(xDirLight);
    scene.add(yDirLight);
    scene.add(zDirLight);
    scene.add(ambientLight);
    scene.add(gridHelper);

    animationLoop(updateAndRender);
}


function updateAndRender(dt){
    snake.update(dt);
    /*VIEWPORT.ortho.max += dt * 3;
    updateCamera(camera);*/
    renderer.render(scene, camera);
}

function onKeyDown(event){
    
}

function windowSizeChanged(renderer, camera){
    if (VIEWPORT.width != window.innerWidth || VIEWPORT.height != window.innerHeight) {
        VIEWPORT.width = window.innerWidth;
        VIEWPORT.height = window.innerHeight;
        renderer.setSize(VIEWPORT.width, VIEWPORT.height);
        updateCamera()
    }
    return true;
}

function updateCamera(camera) {
    camera.aspect = VIEWPORT.aspect();
    if (VIEWPORT.mode == 'ORTHO') {
        camera.left = VIEWPORT.ortho.left();
        camera.right = VIEWPORT.ortho.right();
        camera.top = VIEWPORT.ortho.top();
        camera.bottom = VIEWPORT.ortho.bottom();
    }
    camera.updateProjectionMatrix();
}

function animationLoop(callback){
    let clock = new THREE.Clock(true);
    function _animationLoop() {
        callback(clock.getDelta());
        requestAnimationFrame(_animationLoop);
    }
    requestAnimationFrame(_animationLoop);
}

$(document).ready(start);