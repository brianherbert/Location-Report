Teams = new Meteor.Collection("teams");

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



// For listing all the teams
Template.page.teams = function () {
  //console.log(Teams.find({}, {sort: {name: -1}}));
  return Teams.find({}, {sort: {name: -1}});
};
// A single team
Template.team.team = function () {
  return Teams.findOne({'_id':Session.get("currentTeamId")});
};

// The admin of a team
Template.team.administrator = function () {

  var tm = Teams.findOne({'_id':Session.get("currentTeamId")});
  if(!tm) {
    return false;
  }

  var admin = Meteor.users.findOne({'_id':tm.adminId});
  if(!admin) {
    return false;
  }

  return admin;
};

// The members on a team
Template.team.members = function () {
  var tm = Teams.findOne({'_id':Session.get("currentTeamId")});
  if(!tm) {
    return false;
  }
  return Meteor.users.find({_id: { $in : tm.members }}).fetch();
};

// Update a user profile
Template.profile.events({
  'click input.updateProfile' : function () {
    var name = document.getElementById("updateProfileName").value;
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.name":name}});
  }
});

// Submit form for creating a team
Template.page.events({
  'click input.createTeam' : function () {
    var teamName = document.getElementById("newTeamName").value;
    var id = teamName.toLowerCase();
    Teams.insert({_id: id,
                  name: teamName,
                  adminId: Meteor.userId(),
                  members: [Meteor.userId()]
                });
    document.getElementById("newTeamName").value = '';
  }
});

Meteor.startup(function () {
  Session.set('currentTeamId', false);
});