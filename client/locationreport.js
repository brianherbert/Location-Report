Meteor.startup(function () {
  Session.set('currentTeamId', false);
});

Teams = new Meteor.Collection("teams");
Locations = new Meteor.Collection("locations");

Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function () {

  this.route('home', {
    path: '/',
    template: 'page'
  });

  this.route('profile', {
    path: '/profile',
    template: 'profile'
  });

  this.route('team', {
    path: '/team/:_id/',
    template: 'team',
    after: function () {
      Session.set("currentTeamId", this.params._id);
    },
  });

});







// Submit form for creating a team
Template.page.events({
  'click button.createTeam' : function () {
    var teamName = document.getElementById("newTeamName").value;
    var id = teamName.toLowerCase();
    Teams.insert({_id: id,
                  name: teamName,
                  adminId: Meteor.userId(),
                  members: [Meteor.userId()]
                });
    document.getElementById("newTeamName").value = '';

    $('button.createTeam').addClass('btn-success');
    $('button.createTeam').text('Team Created!');
    Meteor.setTimeout(function(){
      console.log('clear it.');
      $('button.createTeam').removeClass('btn-success');
      $('button.createTeam').text('Create Team');
    },2000);
  }
});