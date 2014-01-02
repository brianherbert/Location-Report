Teams = new Meteor.Collection("teams");
Locations = new Meteor.Collection("locations");

Meteor.subscribe("teams");

var map;
var globalLayerGroup;
L.Icon.Default.imagePath = '/packages/leaflet/images';

Meteor.startup(function () {
  Session.set('currentTeamId', false);
});

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

  if(Meteor.user() == null)
    return false;

  var teams = Teams.find({}, {sort: {name: 1}}).fetch();

  console.log(teams);
  return teams;
};

Template.header.title = function () {
  //return Meteor.settings.title;
  // TODO: Get the title out of settings to work on the client side
  return 'Location Report';
};

Template.header.rendered = function () {
  // Start fresh with the map
  if(map === undefined)
  {
    //console.log('Create new map');
    //var southWest = new L.LatLng(-90, -270),
    //    northEast = new L.LatLng(90, 270);
    map = L.map('map',{
                scrollWheelZoom:false,
                //maxBounds: new L.LatLngBounds(southWest, northEast),
                minZoom:2
              }).fitWorld();

    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
      }).addTo(map);
  }
};

Template.page.rendered = function () {
  //console.log('Template.page.rendered');
  if(globalLayerGroup !== undefined) {
    globalLayerGroup.clearLayers();
  }
  // Hide map
  $('#map').css('height',0);
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
        },
        pointToLayer: function(feature, latlng) {
          var img = feature.properties.icon+'?size=50'
          var icon = L.icon({
                        iconUrl:     img,
                        iconSize:    [60,50], // +10 width for CSS 10px border
                        iconAnchor:  [30,25], // Middle
                        popupAnchor: [145,19],
                        className:   'avatarIcon'
                      });
          return L.marker(latlng, {icon: icon});
          //var myIcon = L.divIcon({className: 'my-div-icon'});
          //return new L.Marker(latlng, {icon: myIcon});
        },
      }).addTo(map);
      map.fitBounds(globalLayerGroup.getBounds());
    }
    return;
  }
});


// Submit form for creating a team
Template.page.events({
  'click button.createTeam' : function () {
    var teamName = document.getElementById("newTeamName").value;
    var id = teamName.toLowerCase();

    if(Teams.find({_id : id}).count() > 0) {
      console.log('TODO: Warn that the team already exists');
      return false;
    }

    Teams.insert({_id: id,
                  name: teamName,
                  adminId: Meteor.userId(),
                  members: [Meteor.userId()]
                });
    document.getElementById("newTeamName").value = '';

    $('button.createTeam').addClass('btn-success');
    $('button.createTeam').text('Team Created!');
    Meteor.setTimeout(function(){
      //console.log('clear it.');
      $('button.createTeam').removeClass('btn-success');
      $('button.createTeam').text('Create Team');
    },2000);
  }
});