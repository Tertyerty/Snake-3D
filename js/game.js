class SnakeGame{
    constructor(){
        this.viewport = new Viewport(window.innerWidth, window.innerHeight, 'ORTHO', 40);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.viewport.width, this.viewport.height);

        this.scene = new THREE.Scene();

        this.camera;
        if(this.viewport.mode == 'PERSPECTIVE') {
            this.camera = new THREE.PerspectiveCamera(45, this.viewport.aspect(), this.viewport.near, this.viewport.far);
        }
        else if (this.viewport.mode == 'ORTHO') {
            this.camera = new THREE.OrthographicCamera(this.viewport.ortho.left(), this.viewport.ortho.right(), this.viewport.ortho.top(), this.viewport.ortho.bottom(), this.viewport.near, this.viewport.far);
        }

            
        this.lights = [];
        this.keyboard = new Keyboard();
        this.grid = new Grid(1, 31);
        this.snake = 0;
            
        this.camera.position.copy(this.grid.gridHelper.position);
        this.camera.position.add(new THREE.Vector3(20, 20, 20));
        this.camera.lookAt(this.grid.gridHelper.position);

        window.addEventListener("resize", () => { this.windowSizeChanged(this.renderer, this.camera) });
    }

    run(){
        this.start();
        this._animationLoop(this.gameLoop);
    }

    gameLoop( time ){
        this.input();
        this.update( time );
        this.render();
    }

    start(){
        this.lights = [
            new THREE.AmbientLight(0xffffff, 0.2),
            new THREE.DirectionalLight(0xff0000, 1.0),
            new THREE.DirectionalLight(0x00ff00, 1.0),
            new THREE.DirectionalLight(0x0000ff, 1.0),
        ];
        this.lights[1].position.set(1, 0, 0)
        this.lights[2].position.set(0, 1, 0)
        this.lights[3].position.set(0, 0, 1)

        this.snake = new Snake(this.scene, this.grid, {
            position: this.grid.randomPosition(),
            tick: 0.1,
        });

        let sphereGeo = new THREE.SphereGeometry(0.5, 4, 2);
        let sphereMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xFFFFFF)
        });
        this.food = new THREE.Mesh(sphereGeo, sphereMaterial);
        this.food.position.copy(this.grid.randomPosition());

        for (let light of this.lights) {
            this.scene.add(light);
        }

        this.scene.add(this.food);

        let axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        this.scene.add(this.grid.gridHelper);
    }

    input(){
        this.snake.input(this.keyboard);
    }
    
    update( time ){
        this.snake.input(this.keyboard);

        this.food.position.y = Math.sin(time.elapsed * 5) * 0.2 + 0.5;
        this.food.rotation.y += time.deltaTime;
        let foodInGrid = this.grid.worldToGrid(this.food.position);
        //console.log(`Grid { x: ${foodInGrid.x}, y: ${foodInGrid.y}, z: ${foodInGrid.z}}, World {x: ${food.position.x}, y: ${food.position.y}, z: ${food.position.z}}`);
        if (this.snake.eat(foodInGrid)) {
            this.food.position.copy(this.grid.randomPosition());
            this.food.position.y = 0.5;
        }
        this.snake.update(time.deltaTime);
    }


    render(){
        this.renderer.render(this.scene, this.camera);
    }

    windowSizeChanged() {
        if (this.viewport.width != window.innerWidth || this.viewport.height != window.innerHeight) {
            this.viewport.width = window.innerWidth;
            this.viewport.height = window.innerHeight;
            this.renderer.setSize(this.viewport.width, this.viewport.height);
            this.updateCamera()
        }
    }

    updateCamera() {
        this.camera.aspect = this.viewport.aspect();
        if (this.viewport.mode == 'ORTHO') {
            this.camera.left = this.viewport.ortho.left();
            this.camera.right = this.viewport.ortho.right();
            this.camera.top = this.viewport.ortho.top();
            this.camera.bottom = this.viewport.ortho.bottom();
        }
        this.camera.updateProjectionMatrix();
    }


    _windowSizeChanged(renderer, camera) {
        if (this.viewport.width != window.innerWidth || this.viewport.height != window.innerHeight) {
            this.viewport.width = window.innerWidth;
            this.viewport.height = window.innerHeight;
            renderer.setSize(this.viewport.width, this.viewport.height);
            this._updateCamera(camera)
        }
        return true;
    }

    _updateCamera(camera) {
        camera.aspect = this.viewport.aspect();
        if (this.viewport.mode == 'ORTHO') {
            camera.left = this.viewport.ortho.left();
            camera.right = this.viewport.ortho.right();
            camera.top = this.viewport.ortho.top();
            camera.bottom = this.viewport.ortho.bottom();
        }
        camera.updateProjectionMatrix();
    }

    _animationLoop(callback) {
        let clock = new THREE.Clock(true);
        let elapsedTime = 0;
        let self = this;
        function _animationLoop_() {
            let dt = clock.getDelta();
            elapsedTime += dt;
            let time = {
                elapsed: elapsedTime,
                deltaTime: dt
            }
            self[callback.name](time);
            requestAnimationFrame(_animationLoop_);
        }
        requestAnimationFrame(_animationLoop_);
    }
}