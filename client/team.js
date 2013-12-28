var map;
var globalLayerGroup;
L.Icon.Default.imagePath = '/packages/leaflet/images'

// For listing all the teams
Template.page.teams = function () {

  if(Meteor.user() == null)
    return false;

  var teams = Teams.find({members:Meteor.user()._id}, {sort: {name: -1}});
  return teams;
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
    //console.log(members[i].profile.latest);
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
            "description": "<p>"+members[i].profile.name+" ("+members[i]._id+")</p>",
        }
    });
  }

  Meteor.call('updateMap', geojson);

  return JSON.stringify(geojson);
};

Template.team.rendered = function () {

  // Start fresh with the map
  if(map === undefined)
  {
    console.log('Create new map');
    map = L.map('map').fitWorld();

    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
      }).addTo(map);
  }

};

Template.team.destroyed = function () {
  console.log('Team Destroyed');
  console.log('TODO: Wipe out map entirely');
};

Meteor.methods({
  updateMap: function (geojson) {
    if(map !== undefined) {
      if(globalLayerGroup !== undefined) {
        globalLayerGroup.clearLayers();
      }
      globalLayerGroup = L.geoJson(geojson, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.description);
        }
      }).addTo(map);
    }
    return;
  }
});

Template.team.events({
  'click input.inviteToTeam' : function () {
    var email = document.getElementById("inviteToTeamEmail").value;
    Meteor.call('inviteToTeam',Session.get('currentTeamId'),email,function(err, data){
      // Invite Complete
    });
  }
});