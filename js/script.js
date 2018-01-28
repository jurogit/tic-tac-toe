/* ***************************************************** */
/* Inspiration and code sample from Tony Ko */
/* https://github.com/htkoca/fcc-tic-tac-toe-widget  */
/* ***************************************************** */
/* ***************************************************** */
/* init */
/* ***************************************************** */
// winning combinations
var winCombos = [
  [ 0, 1, 2 ], // rows
  [ 3, 4, 5 ],
  [ 6, 7, 8 ],
  [ 0, 3, 6 ], // columns
  [ 1, 4, 7 ],
  [ 2, 5, 8 ],
  [ 0, 4, 8 ], // diagonal
  [ 6, 4, 2 ]
];
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var players = {
  1: {
    "type": "human",
    "sign": "xSign",
    "score": 0
  },
  2: {
    "type": "computer",
    "sign": "oSign",
    "score": 0
  }
};
var turn;
var outcome = 0;
var winSpaces;
var playSound = new Audio( "audio/Cancel8-Bit.ogg" );
var drawSound = new Audio( "audio/Confirm8-Bit.ogg" );
var winSound = new Audio( "audio/RobotNoise.ogg" );


/* ***************************************************** */
/* UI */
/* ***************************************************** */
$.fn.extend({
  showElement: function() {
    var element = this;
    $(element).removeClass("transparent");
    $(element).removeClass("hidden");
  },
  hideElement: function() {
    var element = this;
    $(element).addClass("hidden");
    setTimeout(function() {
      $(element).addClass("transparent");
    }, 800);
  }
});

function drawX(spaceId) {
  var canvas = document.getElementById(spaceId);
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(70, 70);
    ctx.moveTo(10, 70);
    ctx.lineTo(70, 10);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawO(spaceId) {
  var canvas = document.getElementById(spaceId);
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(40, 40, 30, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function clearCanvas(spaceId) {
  var canvas = document.getElementById(spaceId);
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 80, 80);
  }
}

function addMarker(arr) {
  for (var i in arr) {
    $("canvas#" + arr[i]).addClass("special");
  }
}

function removeMarker() {
  if ($("canvas").hasClass("special")) {
    $("canvas").removeClass("special");
  }
}

function setView(view) {
  switch (view) {
    case "select":
      $("#message").html("Select Players");
      $("#intro, #select").showElement();
      $("#board, #score, #back, #reset").hideElement();
      drawX(players[1]["sign"]);
      drawO(players[2]["sign"]);
      break;
    case "game":
      $("#intro, #select").hideElement();
      $("#board, #score, #back, #reset").showElement();
      break;
  }
}

function setMessage(str) {
  $("#message").html(str);
}

function placeSign(space, turn) {
  if (turn) {
    if (turn === 1) {
      drawX(space);
    } else {
      drawO(space);
    }
  } else {
    clearCanvas(space);
  }
  playSound.play();
}

function setScore(turn) {
  $("#score #p" + turn + "-score .p-score").html(("0" + players[turn]["score"]).slice(-2));
}


/* ***************************************************** */
/* Game */
/* ***************************************************** */
$(document).ready(function() {
  setView("select");

  /* ***************************************************** */
  /* Button Events */
  /* ***************************************************** */
  // player type selector
  $("#select .choice .button").click(function() {
    var data = this.id.split("-");
    data[0] = parseInt(data[0].charAt(1), 10);
    console.log('data:', data);
    console.log('data[0]:', data[0]);
    switch (data[1]) {
      case "human":
        $("#p" + data[0] + "-computer").removeClass("active");
        $("#p" + data[0] + "-human").addClass("active");
        players[data[0]]["type"] = "human";
        break;
      case "computer":
        $("#p" + data[0] + "-computer").addClass("active");
        $("#p" + data[0] + "-human" ).removeClass("active");
        players[data[0]]["type"] = "computer";
        break;
    }
  });

  $("#back").click(function() {
    setView("select");
  });

  // go / reset button
  $("#go").click(function() {
    resetScore();
    init();
  });

  // go / reset button
  $("#reset").click( function() {
    init();
  });

  // game space click
  $("#board canvas").click(function() {
    if (players[turn]["type"] === "human" && board[parseInt(this.id,10)] === 0) { // only lets you press if your turn is human
      action(this.id);
    }
  });

  /* ***************************************************** */
  /* Logic */
  /* ***************************************************** */
  function resetScore() {
    players[1]["score"] = 0;
    players[2]["score"] = 0;
    setScore(1);
    setScore(2);
  }

  // set up game board
  function init() {
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    outcome = 0;
    removeMarker();
    for (var i in board) {
      placeSign(i);
    }
    setView("game");
    turn = Math.round(Math.random()) + 1;
    console.log("fn init -> turn:", turn);
    setMessage("Player " + turn + "\'s Turn");
    if (players[turn]["type"] === "computer" ) { // call action if computer first
      action();
    }
  }

  // called from init or button press
  function action(space) {
    if (!outcome) {
      setMessage("Player " + turn + "\'s Turn");
      if (players[turn]["type"] === "human") {
        space = parseInt(space, 10);
        board[space] = turn;
        placeSign(space, turn); // mark game space
      } else {
        space = suggestMove();
        board[space] = turn;
        placeSign(space, turn);
      }
      outcome = evalOutcome(turn);
      if (outcome === 1) {
        setMessage("Player " + turn + " Wins!");
        winSound.play();
      } else if (outcome === 2) {
        setMessage("Draw!");
        drawSound.play();
      }
      turn = (turn === 1 ? 2 : 1);
      if (players[turn]["type"] === "computer") { // launch turn if computer
        action();
      }
    }
  }

  function suggestMove() {
    for (var row in winCombos) {
      var move = 0;
      var result1 = 0;
      var result2 = 0;
      for (var rowidx in winCombos[row]) {
        if (board[winCombos[row][rowidx]] === 1) {
          result1++;
        } else if (board[winCombos[row][rowidx]] === 2) {
          result2++;
        } else {
          move = winCombos[row][rowidx];
        }
      }
      if (result1 === 2 || result2 === 2) {
        if (board[move] === 0) {
          return move;
        }
      }
    }
    var remain = [];
    for (var idx in board) {
      if (!board[idx]) {
        remain.push(idx);
      }
    }
    var rand = Math.floor(Math.random() * remain.length);
    return remain[rand];
  }

  function evalOutcome(turn) {
    for (var row in winCombos) {
      var result = 0;
      for (var rowidx in winCombos[row]) {
        if (board[winCombos[row][rowidx]] === turn) {
          result++;
        }
      }
      if (result === 3) {
        players[turn]["score"]++;
        setScore(turn);
        winSpaces = winCombos[row];
        addMarker(winSpaces);
        return 1;
      }
    }
    for (var idx in board) {
      if (!board[idx]) {
        return 0;
      }
    }
    return 2;
  }

}); // end $(document).ready()
