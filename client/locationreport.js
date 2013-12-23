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
  var members = Meteor.users.find({_id: { $in : tm.members }}).fetch();

  return members;
};

Template.profile.latest = function () {
  var loc = Locations.findOne({_id:Meteor.user()._id});
  if(loc === undefined) {
    loc = {latest:{geo:{lat:0,lon:0},timestamp:0,service:null}};
  }
  return loc.latest;
};



// Update a user profile
Template.profile.events({
  'click input.updateProfile' : function () {
    var name            = document.getElementById("updateProfileName").value;
    var twitterHandle   = document.getElementById("updateTwitterHandle").value;
    var instagramHandle = document.getElementById("updateInstagramHandle").value;

    var data = {"profile.name":name,
                "profile.twitterHandle":twitterHandle,
                "profile.instagramHandle":instagramHandle
              }

    // Make sure we aren't setting the Instagram User ID if we don't have an instagram handle anymore.
    if(!instagramHandle){
      data["profile.instagramUserId"] = "";
    }

    Meteor.users.update({_id:Meteor.user()._id}, {$set:data});

    if(instagramHandle) {
      Meteor.call('updateInstagramUserId',function(err, data){
        console.log('Finished updating users Instagram user ID');
      });
    }
  },
  'click input.updateLocation' : function () {
    Meteor.call('updateTweetGeo',function(err, data){
      console.log(data);
    });
    Meteor.call('updateInstagramGeo',function(err, data){
      console.log(data);
    });
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