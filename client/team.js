
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

Template.team.tzDate = function () {
  if(this.profile.latest.timezone === undefined)
    return 'Unknown Date';
  return moment().tz(this.profile.latest.timezone).format('MMM Do');
};

Template.team.tzTime = function () {
  if(this.profile.latest.timezone === undefined)
    return 'Unknown Timezone';
  return moment().tz(this.profile.latest.timezone).format('h:mm a');
};

Template.team.rendered = function() {
  var height = $(document).height()/2;
  if(height > 500) height = 500;
  $('#map').css('height',height);
};

Template.team.events({
  'click input.inviteToTeam' : function () {
    var email = document.getElementById("inviteToTeamEmail").value;
    Meteor.call('inviteToTeam',Session.get('currentTeamId'),email,function(err, data){
      // Invite Complete
    });
  },
  'click a.getGeoJson' : function () {
    $('.geoJsonArea').removeClass('hidden');
  },
  'click a.selectFlag' : function () {
    $('.selectedFlag').hide();
    $('.selectedFlag[data-userId="'+this._id+'"]').show();
  },
  'click a.updateUserLocation' : function () {
    console.log(this._id);
    Meteor.call('updateTweetGeo',this._id,function(err, data){
      // Updating Tweet Geo Complete
    });
    Meteor.call('updateInstagramGeo',this._id,function(err, data){
      // Updating Instagram Geo Complete
    });
  }
});