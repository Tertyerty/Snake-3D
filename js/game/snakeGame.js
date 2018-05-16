class SnakeGame{
    constructor(players){

        

        this.viewport = new Viewport(window.innerWidth, window.innerHeight, 'ORTHO', 40);

        this.renderer = new THREE.WebGLRenderer( {alpha: true} );
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(this.viewport.width, this.viewport.height);

        this.scene = new THREE.Scene();

        let self = this;

        this.camera;
        if(this.viewport.mode == 'PERSPECTIVE') {
            this.camera = new THREE.PerspectiveCamera(45, this.viewport.aspect(), this.viewport.near, this.viewport.far);
        }
        else if (this.viewport.mode == 'ORTHO') {
            this.camera = new THREE.OrthographicCamera(this.viewport.ortho.left(), this.viewport.ortho.right(), this.viewport.ortho.top(), this.viewport.ortho.bottom(), this.viewport.near, this.viewport.far);
        }

        this.viewport.onViewportResized((viewport) => {
            this.renderer.setSize(viewport.width, viewport.height);
            this.updateCamera()
        });

            
        this.lights = [];

        this.grid = new Grid(1, 31);

        this.camera.position.copy(this.grid.gridHelper.position);
        this.camera.position.add(new THREE.Vector3(20, 20, 20));
        this.camera.lookAt(this.grid.gridHelper.position);
        
        this.keyboard = new Keyboard();        
        this.amountPlayers = players;
        this.players = [];
        this.playerControllers = [];
        this.defaultController = new InputMapping(this.keyboard);
        this.food = [];
        this.clock = new THREE.Clock();
        this.paused = false;
        

        this.onGamePauseCallback = (self) => { console.log('Game paused!'); };
        this.onGameUnpauseCallback = (self) => { console.log('Game unpaused!'); };
        this.onGameEndCallback = (self, playerId) => { console.log(`Game ended player ${playerId} won!`); };

        this.models = ['buho', 'gallinita', 'gallina2', 'gallina3', 'pato', 'manzana'];

        this.objIndex = 0;
        for (let model of this.models) {
            let obj = model + '.obj';
            let mtl = model + '.mtl';
            this.loadOBJWithMTL('../assets/', obj, mtl, (object) => {
                object.position.copy(self.grid.center());
                object.position.x += (self.objIndex * 10 - 30) + self.grid.cellSize * 0.5;
                object.position.z += self.grid.cellSize * 0.5;
                object.scale.set(0.2, 0.2, 0.2);
                self.scene.add(object);
                self.objIndex++;
            });
        }

        this.loadOBJWithMTL('../assets/', 'jardin1.obj', 'jardin1.mtl', (object) => {
            console.log(self.grid.center());
            object.position.copy(self.grid.center());
            object.position.x += self.grid.cellSize * 0.5;
            object.position.z += self.grid.cellSize * 0.5;
            object.position.y -= 31;
            self.scene.add(object);
        });

    }

    loadOBJWithMTL(path, objFile, mtlFile, onLoadCallback) {
        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(path);
        mtlLoader.load(mtlFile, (materials) => {
            let objLoader = new THREE.OBJLoader();
            objLoader.setPath(path);
            objLoader.setMaterials(materials);
            objLoader.load(objFile, (object) => { onLoadCallback(object) });
        });

    }

    run(){
        this.start();
        this._animationLoop(this.gameLoop);
    }

    gameLoop( time ){
        this.input();
        if(!this.paused){
            this.update( time );
        }
        this.render();
    }

    start(){
        this.lights = [
            new THREE.AmbientLight(0xffffff, 0.2),
            new THREE.DirectionalLight(0xffffff, 1.0),
            //new THREE.DirectionalLight(0xff0000, 1.0),
            //new THREE.DirectionalLight(0x00ff00, 1.0),
            //new THREE.DirectionalLight(0x0000ff, 1.0),
        ];
        this.lights[1].position.set(1, 0.8, 0.5);
        //this.lights[1].position.set(1, 0, 0)
        //this.lights[2].position.set(0, 1, 0)
        //this.lights[3].position.set(0, 0, 1)

        let playerGeometry = new THREE.BoxGeometry(1, 1, 1);
        let playerMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(0xffffff) });
        let playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);

        for(let i = 0; i < this.amountPlayers; i++){
            this.players.push(new Snake(this.scene, this.grid, {
                playerId: i,
                position: this.grid.randomPosition(),
                length: 4,
                tick: 0.1,
                //geometry: playerGeometry,
                //material: playerMaterial,
                mesh: playerMesh.clone(),
            }));
        }

        //TODO: Create a configuration file to store the inputmappings of every player.
        this.playerControllers.push( new InputMapping(this.keyboard, {
            'Left': 'A',
            'Right': 'D',
            'Grow': 'shift + R',
            'Jump': 'space bar'
        }));

        this.playerControllers.push(new InputMapping(this.keyboard, {
            'Left': 'left',
            'Right': 'right',
            'Grow': 'shift + l',
            'Jump': 'numpad 0'
        }));

        let sphereGeo = new THREE.SphereGeometry(0.5, 4, 2);
        let sphereMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xFFFFFF)
        });
        for(let i = 0; i < this.players.length; i++){
            let f = new THREE.Mesh(sphereGeo, sphereMaterial)
            f.position.copy(this.grid.randomPosition());
            this.food.push(f);
            this.scene.add(f);
        }

        for (let light of this.lights) {
            this.scene.add(light);
        }

        

        let axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        this.scene.add(this.grid.gridHelper);
    }



    input(){
        for (let player of this.players) {
            let controller = this.playerControllers[player.playerId] || this.defaultController;
            player.input(controller);
        }
        if(this.keyboard.pressed('esc')){
            if(!this.paused)
                this.pause();
            else
                this.unpause();
            this.keyboard.pressed('esc', false);
        }
    }
    
    update( time ){
        for (let player of this.players) {

            for (let f of this.food){
                f.position.y = Math.sin(time.elapsed * 5) * 0.2 + 0.5;
                f.rotation.y += time.deltaTime;

                let foodInGrid = this.grid.worldToGrid(f.position);
                if (player.eat(foodInGrid)) {
                    f.position.copy(this.grid.randomPosition());
                }
            }

            
            player.update(time);
            for(let second of this.players){
                if(player.intersects(second)){
                    player.alive = false;
                    console.log(player.playerId);
                }
            }
        }

    }


    render(){
        this.renderer.render(this.scene, this.camera);
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

    onGamePaused(callback){
        if (callback) {
            this.onGamePauseCallback = callback;
        }
        else {
            this.onGamePauseCallback(this);
        }   
    }

    onGameUnpaused(callback) {
        if (callback) {
            this.onGameUnpauseCallback = callback;
        }
        else {
            this.onGameUnpauseCallback(this);
        }
    }

    onGameEnd(callback){
        if(callback){
            this.onPauseCallback = callback;
        }else{
            this.onGameEndCallback(this, 0);
        }
    }

    pause(){
        if(!this.paused){
            this.paused = !this.paused;
            this.clock.stop();
            this.onGamePaused();
        }
    }

    unpause(){
        if(this.paused){
            this.paused = !this.paused;
            this.clock.start();
            this.onGameUnpaused();
        }
    }
    _animationLoop(callback) {
        this.clock.start();
        let elapsedTime = 0;
        let self = this;
        function _animationLoop_() {
            let dt = self.clock.getDelta();
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