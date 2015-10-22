Game = new Mongo.Collection("game");

if (Meteor.isClient) {

  Template.player1.events({
    'click .rps': function (event) {
      console.log();
      var choice = $(event.target).data().rps;;
      var id = Game.find({name: 'player1'}).fetch()[0]._id;
      // Game.update(id, {$inc: {score: 1}});
      Game.update(id, {$set: {choice: choice}});
      Game.update(id, {$set: {status: 'thrown'}});
      console.log(id);

      // check winner   
      var winner = pickWinner();
      return winner
    }
  });

  Template.player2.events({
    'click .rps': function (event) {
      console.log();
      var choice = $(event.target).data().rps;;
      var id = Game.find({name: 'player2'}).fetch()[0]._id;
      // Game.update(id, {$inc: {score: 1}});
      Game.update(id, {$set: {choice: choice}});
      Game.update(id, {$set: {status: 'thrown'}});
      console.log(id);
      var winner = pickWinner();
    }
  });

  Template.player1.helpers ({
  });

  Template.body.helpers({
    players: function() {
      return Game.find({});
    },
    winner: function() {
      return Session.get('winner');
    }
  });

  var pickWinner = function() {
    var player1Id = Game.find({name: 'player1'}).fetch()[0]._id;
    var player2Id = Game.find({name: 'player2'}).fetch()[0]._id;
    var player1Choice = Game.find({name: 'player1'}).fetch()[0].choice;
    var player2Choice = Game.find({name: 'player2'}).fetch()[0].choice;
    var winMap = {
      rock: 'paper',
      paper: 'scissors',
      scissors: 'rock'
    };

    if(winMap[player1Choice] === player2Choice) {
      Game.update(player2Id, {$inc: {score: 1}});
      Session.set('winner', 'Player 2 Wins!');
    } else if (player1Choice === player2Choice) {
       Session.set('winner', 'tied');
    } else {
      Game.update(player1Id, {$inc: {score: 1}});
       Session.set('winner', 'Player 1 Wins!');
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
        status: 'not thrown'
      });

      Game.insert({
        name: 'player2',
        score: 0,
        choice: null,
        status: 'not thrown'
      });
    }
  });
}

Meteor.methods({
  setThrow: function(choice, player) {
    return Game.insert({
        name: player,
        choice: choice
    });
  }
});

// routes
Router.route('/player1');
Router.route('/player2');

