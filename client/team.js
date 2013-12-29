
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

Template.team.geojson = function () {
  var tm = Teams.findOne({'_id':Session.get("currentTeamId")});
  if(!tm) {
    return false;
  }
  var members = Meteor.users.find({_id: { $in : tm.members }}).fetch();

  var geojson = {};
  geojson["type"] = "FeatureCollection";
  geojson["features"] = [];

  var i;
  for (i = 0; i < members.length; ++i) {
    if(members[i].profile.latest === undefined) {
      continue;
    }
    var desc = "<strong>"+members[i].profile.name+"</strong><br/>"
    desc += "Last seen on: "+members[i].profile.latest.service
    geojson.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          members[i].profile.latest.geo.lon,
          members[i].profile.latest.geo.lat
        ]
      },
      "properties": {
        "description": desc,
        "icon": members[i].profile.avatar
      }
    });
  }


  Meteor.call('updateMap', geojson);

  return JSON.stringify(geojson);
};

Template.team.rendered = function() {
  $('#map').css('height',$(document).height()/2);
};

Template.team.destroyed = function () {
  console.log('TODO: Wipe out map entirely');
  //console.log(globalLayerGroup);
  //if(globalLayerGroup !== undefined) {
    //globalLayerGroup.clearLayers();
  //}
};

Template.team.events({
  'click input.inviteToTeam' : function () {
    var email = document.getElementById("inviteToTeamEmail").value;
    Meteor.call('inviteToTeam',Session.get('currentTeamId'),email,function(err, data){
      // Invite Complete
    });
  }
});