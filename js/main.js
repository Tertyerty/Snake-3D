let snakeGame = 0;

function start(){
    let numberPlayers = 2;
    snakeGame = new SnakeGame(numberPlayers);
    $('#canvas-section').append(snakeGame.renderer.domElement);
    
    snakeGame.onGamePaused(function () {
        console.log('callback overriden');
    });

    snakeGame.run();
}

$(document).ready(start);