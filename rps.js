Game = new Mongo.Collection("game");

if (Meteor.isClient) {
  Template.body.events({
    'click .new-game': function() {
      event.preventDefault();
      Meteor.call('newGame');
    },
    'click .reset-scores': function() {
      event.preventDefault();
      Meteor.call('resetScores');
    }
  });

  Template.player1.events({
    'click .rps': function (event) {
      var choice = $(event.target).data().rps;
      var id = Game.findOne({name: 'player1'})._id;
      setThrow(id, choice);
    }
  });

  Template.player2.events({
    'click .rps': function (event) {
      var choice = $(event.target).data().rps;
      var id = Game.findOne({name: 'player2'})._id;
      setThrow(id, choice);
    }
  });

  Template.player1.helpers ({
  });

  Template.body.helpers({
    players: function() {
      return Game.find({});
    }
  });

  var setThrow = function(id, choice) {
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

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // initialize dabase with two players if they don't exist
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

Meteor.methods({
  'resetScores': function() {
    Game.update({}, {$set: {score: 0}}, {multi: true});
  },
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

