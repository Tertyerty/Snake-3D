class Snake{

    constructor(scene, grid, args){
        if(!args) args = {};
        this.geometry = args['geometry'] || new THREE.BoxGeometry(1,1,1);
        this.material = args['material'] || new THREE.MeshLambertMaterial({color: new THREE.Color(0xffffff)});
        this.mesh = args['mesh'] || new THREE.Mesh(this.geometry, this.material);
        let pos = args['position'] || new THREE.Vector3(0, 0, 0);
        this.mesh.position.copy(pos);

        this.direction = args['direction'] || "DOWN";
        this.velocity = args['velocity'] || new THREE.Vector3(0, 0, 1);
        this.position = this.mesh.position;
        
        this.history = [];
        //this.history.push(this.pos);
        this.scene = scene;
        this.setDirection(this.direction);
        this.scene.add(this.mesh);
        this.clock = new THREE.Clock(true);
        this.tick = args['tick'] || 1;
        this.newDirection = 'DOWN';

        this.grid = grid;
    }

    input(keyboard){
        /*
        if (keyboard.pressed('W')) this.newDirection = 'UP';
        if (keyboard.pressed('A')) this.newDirection = 'LEFT';
        if (keyboard.pressed('S')) this.newDirection = 'DOWN';
        if (keyboard.pressed('D')) this.newDirection = 'RIGHT';
        */
        
        if (keyboard.pressed('A')){ 
            this.rotateDir(90);
            keyboard.pressed('A', false);
        }
        if (keyboard.pressed('D')){ 
            this.rotateDir(-90);
            keyboard.pressed('D', false);
        }
        
        
        if (keyboard.pressed('shift+R')) {
            this.grow();
            //keyboard.pressed('shift+R', false);
        }
    }

    update(dt){
        if(this.clock.getElapsedTime() >= this.tick){
            let scaleRange = {
                max: 0.9,
                min: 0.3
            }
            let scaleStep = scaleRange.max / this.history.length;
            //scaleStep = scaleStep < scaleRange.min ? scaleRange.min : scaleStep;
            let scale = scaleStep;
            for (let i = 0; i < this.history.length - 1; i++) {
                //this.history[i].position.set()
                let next = this.history[i + 1];
                this.history[i].position.copy(next.position);
                if (scale >= scaleRange.min)
                    this.history[i].scale.set(scale, scale, scale);
                else
                    this.history[i].scale.set(scaleRange.min, scaleRange.min, scaleRange.min);
                scale += scaleStep;
            }
            if(this.history.length > 0){
                let first = this.history[this.history.length - 1];
                first.position.copy(this.position);
                first.scale.set(scaleRange.max, scaleRange.max, scaleRange.max);
            }

            this.setDirection(this.newDirection);
            let vel = this.velocity.clone();
            vel.multiplyScalar(this.grid.cellSize);
            this.position.add(vel);
            this.clock.start();
            
            let gridSize = this.grid.gridSize;
            this.position.x = (this.position.x + gridSize) % gridSize;
            this.position.z = (this.position.z + gridSize) % gridSize;

            if (this.intersects(this))
                this._deleteHistory();
        }
    }

    eat(food){
        let gridPosition = this.grid.worldToGrid(this.position);
        let distance = gridPosition.distanceTo(food);
        if(distance == 0){
            this.grow();
        }
        return distance == 0;
    }

    grow(){
        let body = this.mesh.clone();
        this.scene.add(body);
        this.history.push(body);
    }

    _deleteHistory(){
        for(let body of this.history){
            this.scene.remove(body);
        }
        this.history = [];
    }

    intersects(snake){
        let result = false;
        let gridPosition = this.grid.worldToGrid(this.position);
        for(let bodyPart of snake.history){
            let bodyInGrid = this.grid.worldToGrid(bodyPart.position);
            let distance = gridPosition.distanceTo(bodyInGrid);
            if(distance == 0) 
                result = true;
        }
        if(snake != this){
            let otherHead = this.grid.worldToGrid(snake.position);
            let distance = gridPosition.distanceTo(otherHead);
            if (distance == 0)
                result = true;
        }
        return result;
    }

    setDirection(direction){
        direction = direction.toUpperCase();
        if(this.direction != direction){
            let directionChanged = false;            
            switch(direction){
                case 'UP':
                    if( this.direction != 'DOWN') {
                        this.velocity.set(0, 0, -1);
                        directionChanged = true;
                    }
                    break;
                case 'RIGHT':
                    if (this.direction != 'LEFT') {
                        this.velocity.set(1, 0, 0);
                        directionChanged = true;                        
                    }
                    
                    break;
                case 'DOWN':
                    if (this.direction != 'UP') {
                        this.velocity.set(0, 0, 1);
                        directionChanged = true;                        
                    }
                    
                    break;
                case 'LEFT':
                    if (this.direction != 'RIGHT') {
                        this.velocity.set(-1, 0, 0);
                        directionChanged = true;
                    }
                    break;
            }
            if(directionChanged){
                this.direction = direction;
            }
        }
    }

    rotateDir(angle){
        let axis = new THREE.Vector3(0, 1, 0);
        this.velocity.applyAxisAngle(axis, THREE.Math.degToRad(angle));
    }

}