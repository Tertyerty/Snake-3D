class Snake{

    constructor(args, scene){
        if(!args) args = {};
        this.geometry = args['geometry'] || new THREE.BoxGeometry(1,1,1);
        this.material = args['material'] || new THREE.MeshLambertMaterial({color: new THREE.Color(0xffffff)});
        this.mesh = args['mesh'] || new THREE.Mesh(this.geometry, this.material);
        let pos = args['position'] || new THREE.Vector3(0, 0, 0);
        this.mesh.position.copy(pos);

        this.direction = args['direction'] || "DOWN";
        this.velocity = args['velocity'] || new THREE.Vector3(0, 0, 1);
        this.history = [];
        this.history.push(this.pos);
        this.scene = scene;
        this.setDirection(this.direction);
        this.scene.add(this.mesh);
        this.clock = new THREE.Clock(true);
        this.speed = args['speed'] || 1;
    }

    update(dt){
        if(this.clock.getElapsedTime() >= this.speed){
            this.mesh.position.add(this.velocity);
            this.clock.start();
        }
    }

    setDirection(direction){
        if(this.direction != direction){
            this.direction = direction;
            switch(direction){
                case 'UP':
                    this.velocity.set(0, 0, -1);
                    break;
                case 'RIGHT':
                    this.velocity.set(1, 0, 0);
                    break;
                case 'DOWN':
                    this.velocity.set(0, 0, 1);
                    break;
                case 'LEFT':
                    this.velocity.set(-1, 0, 0);
                    break;
            }
        }
    }

}