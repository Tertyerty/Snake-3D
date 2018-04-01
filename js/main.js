let snakeGame = 0;
function start(){
    snakeGame = new SnakeGame();
    $('#canvas-section').append(snakeGame.renderer.domElement);
    snakeGame.run();
}

$(document).ready(start);