// all data is stored in the game collection
Game = new Mongo.Collection("game");

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // initialize database with two players if they don't exist
    if(Game.find().count() === 0) {
      Game.insert({
        name: 'player1',
        score: 0,
        choice: null,
        status: 'not thrown',
        message: null
      });

      Game.insert({
        name: 'player2',
        score: 0,
        choice: null,
        status: 'not thrown',
        message: null
      });
    }
  });
}

if (Meteor.isClient) {
  Template.body.events({
    'click .new-game': function() {
      event.preventDefault();

      // start a new game
      Meteor.call('newGame');
    },
    'click .reset-scores': function() {
      event.preventDefault();

      // reset scores
      Meteor.call('resetScores');
    }
  });

  Template.player1.events({
    'click .rps': function (event) {
      // the choice is rock, paper, or scissors
      var choice = $(event.target).data().rps;
      var id = Game.findOne({name: 'player1'})._id;

      // execute the throw of rock, paper, or scissors
      setThrow(id, choice);
    }
  });

  Template.player2.events({
    'click .rps': function (event) {

      // the choice is rock, paper, or scissors
      var choice = $(event.target).data().rps;
      var id = Game.findOne({name: 'player2'})._id;

      // execute the throw of rock, paper, or scissors
      setThrow(id, choice);
    }
  });

  // message shows the winner
  Template.player1.helpers ({
    message: function() {
      return Game.findOne({name: 'player1'}).message;
    }
  });
  Template.player2.helpers ({
    message: function() {
      return Game.findOne({name: 'player2'}).message;
    }
  });

  Template.body.helpers({
    // return all the player data
    players: function() {
      return Game.find({});
    }
  });

  var setThrow = function(id, choice) {
    // executes a throw, updates the database
    Game.update(id, {$set: {choice: choice}});
    Game.update(id, {$set: {status: 'thrown'}});

    pickWinner();
  };

  var pickWinner = function() {
    var player1 = Game.findOne({name: 'player1'});
    var player2 = Game.findOne({name: 'player2'});

    var winMap = {
      rock: 'paper',
      paper: 'scissors',
      scissors: 'rock'
    };

    // determin the winner and update the message which indicates the winner
    if(player1.status === 'thrown' && player2.status === 'thrown') {
      if(winMap[player1.choice] === player2.choice) {
        Game.update(player2._id, {$inc: {score: 1}});
        
        Game.update(player1._id, {$set: {message: 'Player 2 Wins!'}});
        Game.update(player2._id, {$set: {message: 'Player 2 Wins!'}});
      } else if (player1.choice === player2.choice) {
        Game.update(player1._id, {$set: {message: 'Tie'}});
        Game.update(player2._id, {$set: {message: 'Tie'}});
      } else {
        Game.update(player1._id, {$inc: {score: 1}});

        Game.update(player1._id, {$set: {message: 'Player 1 Wins!'}});
        Game.update(player2._id, {$set: {message: 'Player 1 Wins!'}});
      }
    }
  };
}



Meteor.methods({
  'resetScores': function() {
    Game.update({}, {$set: {score: 0}}, {multi: true});
  },
  // create a new game
  'newGame': function() {
    var obj = {
      choice: null,
      status: 'not thrown',
      message: null
    };
    Game.update({}, {$set: obj}, {multi: true});
  }
});

// routes
Router.route('/player1');
Router.route('/player2');

