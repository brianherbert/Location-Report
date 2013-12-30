Locations = new Meteor.Collection("locations");

Meteor.startup(function () {
  Future = Npm.require('fibers/future');
});

Meteor.methods({
  // geo - lat, lon object
  // service - string for service name ("facebook", "twitter", "instagram", etc)
  // data - object with details to save ie: {geo:{...},since_id:"78h329y8938",...}
  updateLocation: function (service, data) {

    console.log('Updating with service: '+service);

    data.timestamp = parseInt(data.timestamp);

    var updateData = {};
    updateData[service] = data;

    geotz.timezone(data.geo.lat+','+data.geo.lon,data.timestamp,function(error,tz){

      var tzId = false;
      if(tz !== false)
        tzId = tz.timeZoneId;

      updateData[service]['timezone'] = tzId;

      // Get the latest data and compare the timestamp
      var newLatest = false;
      var loc = Locations.findOne({_id:Meteor.user()._id});
      if(loc === undefined
         || (  loc !== undefined
            && loc.latest !== undefined
            && loc.latest.timestamp !== undefined
            && loc.latest.timestamp < data.timestamp)
      ){

        //console.log('This is the most recent location');
        latest = {geo:data.geo,
                  timestamp:data.timestamp,
                  service:service,
                  timezone:tzId
                };

        updateData['latest'] = latest; // for locations collection

        // We will call this often so denormalize by duplicating it in the user profile
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.latest":latest}});

      }

      console.log(updateData);

      Locations.update({_id: Meteor.user()._id},{$set:updateData},{upsert:true});

    });

    return;
  },
  deleteLocations: function () {
    console.log('Delete all locations');
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.latest":{}}});
    Locations.remove({_id:Meteor.user()._id});
    return;
  },
  // Not using this anymore?
  getLatestLocation: function (user_id) {
    var loc = Locations.findOne({_id:Meteor.user()._id});
    if(loc === undefined) {
      loc = {latest:{geo:{lat:0,lon:0},timestamp:0,service:null}};
    }
    return loc.latest;
  }
});

