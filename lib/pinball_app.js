const Game = require('./game');
const GameView = require('./game_view');

document.addEventListener('DOMContentLoaded', function(){
  const canvasEl = document.getElementById('myCanvas');
  canvasEl.width = Game.DIM_X;
  canvasEl.height = Game.DIM_Y;
  const ctx = canvasEl.getContext('2d');

  let game;
  if (window.isCionicGame) {
    MonitorAPI.main();
    game = new Game(MonitorAPI.Players[0]);
  } else {
    game = new Game();
    $('#code').hide();
  }
  new GameView(game, ctx).start();

  document.getElementById('cionic-connect').onclick = game.websocket;
});
