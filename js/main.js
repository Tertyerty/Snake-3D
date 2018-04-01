var renderer = 0;
var scene = 0;
var camera = 0;
var keyboard;


var GRID = {}


let snake = 0;

let food = 0;

let snakeGame = 0;
function start(){
    snakeGame = new SnakeGame();
    $('#canvas-section').append(snakeGame.renderer.domElement);
    snakeGame.run();
}

function updateAndRender(time){
    //snakeGame.input();
    //snakeGame.
}

/*
function start(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(VIEWPORT.width, VIEWPORT.height);
    $('#canvas-section').append(renderer.domElement);

    renderer.setClearColor(new THREE.Color(0x0));

    scene = new THREE.Scene();
    if(VIEWPORT.mode == 'PERSPECTIVE')
        camera = new THREE.PerspectiveCamera(45, VIEWPORT.aspect(), VIEWPORT.near, VIEWPORT.far);
    else if(VIEWPORT.mode == 'ORTHO')
        camera = new THREE.OrthographicCamera(VIEWPORT.ortho.left(), VIEWPORT.ortho.right(), VIEWPORT.ortho.top(), VIEWPORT.ortho.bottom(), VIEWPORT.near, VIEWPORT.far);

    

    //camera.position.set(0, 0, 100);

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    let xDirLight = new THREE.DirectionalLight(0xff0000, 1.0);
    let yDirLight = new THREE.DirectionalLight(0x00ff00, 1.0);
    let zDirLight = new THREE.DirectionalLight(0x0000ff, 1.0);
    xDirLight.position.set(1, 0, 0)
    yDirLight.position.set(0, 1, 0)
    zDirLight.position.set(0, 0, 1)

    let sphereGeo = new THREE.SphereGeometry(0.5, 4, 2);
    let sphereMaterial = new THREE.MeshPhongMaterial ({
        color: new THREE.Color(0xFFFFFF)
    });
    
    window.addEventListener("resize", () => { windowSizeChanged(renderer, camera) });

    GRID = new Grid(1, 31);

    food = new THREE.Mesh(sphereGeo, sphereMaterial);
    food.position.copy( GRID.randomPosition() );
    food.position.y = 0.5;
    
    snake = new Snake(scene, GRID, {
        position: GRID.randomPosition(),
        speed: 0.1,
    } );
    snake.position.y = 0.5;

    var axesHelper = new THREE.AxesHelper(5);
    
    camera.position.copy(GRID.gridHelper.position);
    camera.position.add( new THREE.Vector3(20, 20, 20));
    camera.lookAt(GRID.gridHelper.position);

    scene.add(xDirLight);
    scene.add(yDirLight);
    scene.add(zDirLight);
    scene.add(ambientLight);
    
    scene.add(food);

    scene.add(axesHelper);
    scene.add(GRID.gridHelper);

    keyboard = new Keyboard();

    animationLoop(updateAndRender);
}

function updateAndRender(time){
    snake.input(keyboard);

    food.position.y = Math.sin(time.elapsed * 5) * 0.2 + 0.5;
    food.rotation.y += time.deltaTime;
    let foodInGrid = GRID.worldToGrid(food.position);
    //console.log(`Grid { x: ${foodInGrid.x}, y: ${foodInGrid.y}, z: ${foodInGrid.z}}, World {x: ${food.position.x}, y: ${food.position.y}, z: ${food.position.z}}`);
    if (snake.eat(foodInGrid) ){
        food.position.copy(GRID.randomPosition());
        food.position.y = 0.5;
    }
    snake.update(time.deltaTime);

    /*VIEWPORT.ortho.max += dt * 3;
    updateCamera(camera);
    renderer.render(scene, camera);
}

*/

function windowSizeChanged(renderer, camera, VIEWPORT){
    if (VIEWPORT.width != window.innerWidth || VIEWPORT.height != window.innerHeight) {
        VIEWPORT.width = window.innerWidth;
        VIEWPORT.height = window.innerHeight;
        renderer.setSize(VIEWPORT.width, VIEWPORT.height);
        updateCamera(camera, VIEWPORT)
    }
    return true;
}

function updateCamera(camera, VIEWPORT) {
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
    let elapsedTime = 0;
    function _animationLoop() {
        let dt = clock.getDelta();
        elapsedTime += dt;    
        let time = {
            elapsed: elapsedTime,
            deltaTime: dt
        }
        callback( time );
        requestAnimationFrame(_animationLoop);
    }
    requestAnimationFrame(_animationLoop);
}

$(document).ready(start);