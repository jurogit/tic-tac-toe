/* ***************************************************** */
/* init */
/* ***************************************************** */
/* *****************************************************
Amiket megvaltoztattam:
var combo                   -> var wComb
var players['key']          -> var players['sign']
placeKey(space, turn) {}    -> placeSign(space, turn) {}
// var outcome              -> var endresult
dead                        -> transparent
***************************************************** */
// winning combinations
var wComb = [
  [ 0, 1, 2 ], // rows
  [ 3, 4, 5 ],
  [ 6, 7, 8 ],
  [ 0, 3, 6 ], // columns
  [ 1, 4, 7 ],
  [ 2, 5, 8 ],
  [ 0, 4, 8 ], // diagonal
  [ 6, 4, 2 ]
];
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // tabla
var players = { // jatekosok objektum
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
var turn; // azt jeloli, hogy ki lep
var outcome = 0; // gyoztes (eredmeny) ertekei: 0->dontetlen, 1->player1 win, 2->player2 win

var wSpace;
/*http://rpg.hamsterrepublic.com/ohrrpgce/Free_Sound_Effects#Menu_Interface_Sounds*/
var playSound = new Audio( "audio/Cancel8-Bit.ogg" );
var drawSound = new Audio( "audio/Confirm8-Bit.ogg" );
var winSound = new Audio( "audio/RobotNoise.ogg" );


/* ***************************************************** */
/* UI */
/* ***************************************************** */
/* 
jQuery.fn.extend
Merge the contents of an object onto the jQuery prototype to provide new jQuery instance methods.

jQuery.fn.extend(object) → Object
Arguments
object (Object) : An object to merge onto the jQuery prototype.

Kiboviti a jQuery prototipusat a megadott objektummal
(es annak tulajdonsagaival, metodusaival)
*/
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

/**/
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
/**/

// beallitja a nezetet
function setView(view) {
  switch (view) {
    case "select":
      $("#status #message").html("Select Players");
      $("#game #intro, #dash #select").showElement();
      $("#game #board, #dash #score, #status #back, #status #reset").hideElement();
      drawX(players[1]["sign"]);
      drawO(players[2]["sign"]);
      break;
    case "game":
      $("#game #intro, #dash #select").hideElement();
      $("#game #board, #dash #score, #status #back, #status #reset").showElement();
      break;
  }
}

// uzenetet ir ki
function setMessage(str) {
  $("#status #message").html(str);
}

// bemenetnek megkapja a helyet (space - 0,1,2,3,4,5,6,7,8) es a jatekost (turn - 1 vagy 2, X vagy O)
// megrajzolja a jatekos jelet
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

// beallitja a pontszamot
// a slice(-2) visszaadja a string utolso ket karakteret
function setScore(turn) {
  $("#dash #score #p" + turn + "-score .p-score").html(("0" + players[turn]["score"]).slice(-2));
}


/* ***************************************************** */
/* Game */
/* ***************************************************** */
$(document).ready(function() {
  setView("select");

  // Button Events
  $("#dash #select .choice .button").click(function() { // player type selector
    var data = this.id.split("-");
    data[0] = parseInt(data[0].charAt(1), 10); // atalakitja a data[0] 2-ik karakteret szamma
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

  $("#status #back").click(function() {
    setView("select");
  });

  $("#dash #select #go").click(function() { // go / reset button
    resetScore();
    init();
  });

  $("#status #reset").click( function() { // go / reset button
    init();
  });

  $("#game #board canvas").click(function() { // game space click
    if (players[turn]["type"] === "human" && board[parseInt(this.id,10)] === 0) { // only lets you press if your turn is human
      action(this.id);
    }
  });

  // Logic
  function resetScore() {
    players[1]["score"] = 0;
    players[2]["score"] = 0;
    setScore(1);
    setScore(2);
  }

  function init() { // set up game board
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    outcome = 0;
    /**/
    removeMarker();
    /**/
    for (var i in board) {
      console.log("fn init -> board[" + i + "] = " + board[i]);
      // csak egy argumentummal hivja meg a placeSign() fuggvenyt
      // ezert az "if (turn)" erteke "false" lesz, tehat
      // az else ag hajtodik vegre ami torli ("") az elem tartalmat
      // $("#game #board #" + space).html(""); vagyis esetunkben clearCanvas(space);
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

  function action(space) { // called from init or button press
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
    for (var row in wComb) {
      var move = 0;
      var result1 = 0;
      var result2 = 0;
      for (var rowidx in wComb[row]) {
        if (board[wComb[row][rowidx]] === 1) {
          result1++;
        } else if (board[wComb[row][rowidx]] === 2) {
          result2++;
        } else {
          move = wComb[row][rowidx];
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

  // kiertekeli hogy van-e gyoztes kombinacio (result === 3)
  // es visszaad 1-et ha igen, 2-ot ha dontetlen
  function evalOutcome(turn) { // check for outcomes
    for (var row in wComb) {
      var result = 0;
      for (var rowidx in wComb[row]) {
        if (board[wComb[row][rowidx]] === turn) {
          result++;
        }
      }
      if (result === 3) {
        players[turn]["score"]++;
        setScore(turn);
        /**/
        wSpace = wComb[row];
        addMarker(wSpace);
        /**/
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