

Meteor.methods({
  updateInstagramGeo: function (userId) {

    console.log('Update from Instagram');

    if(!Meteor.users.findOne({_id:userId}).profile.instagramUserId) {
      //console.log('No User ID is set so not updating Instagram Geo');
      return false;
    }

    try {
      //console.log('Calling https://api.instagram.com/v1/users/'+Meteor.user().profile.instagramUserId+'/media/recent/');

      var params = {client_id: Meteor.settings.services.instagram.client_id};
      var min_id = false;

      var loc = Locations.findOne({_id:userId});
      if(loc !== undefined && loc.instagram !== undefined && loc.instagram.min_id !== undefined) {
        min_id = loc.instagram.min_id;
        params['min_id'] = min_id;
      }

      HTTP.call("GET", "https://api.instagram.com/v1/users/"+Meteor.users.findOne({_id:userId}).profile.instagramUserId+"/media/recent/", {params: params}, function(error,pics){
        //console.log('Finished making call, now processing');
        var photos = pics.data.data;

        var i;
        for (i = 0; i < photos.length; ++i) {
          if(photos[i].id != min_id && photos[i].location != null) {
            var geo  = {lat: photos[i].location.latitude, lon: photos[i].location.longitude};
            var data = {geo:geo, min_id:photos[i].id, timestamp: photos[i].created_time};
            Meteor.call('updateLocation', userId, 'instagram', data, function (error, result) {
              console.log('Passed data to Update Location');
            });
            return;
          }
        }

      });
      return true;
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      return false;
    }
  },
  updateInstagramUserId: function () {
    try {
      HTTP.call("GET", "https://api.instagram.com/v1/users/search/", {params: {q: Meteor.user().profile.instagramHandle, count: 1, client_id: Meteor.settings.services.instagram.client_id}}, function(error,users){
        if(users.data.data.length == 0) {
          var instagramUserId = "";
        } else {
          var instagramUserId = users.data.data[0].id;
        }
        //console.log(instagramUserId);
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.instagramUserId":instagramUserId}});
      });
      return true;
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      return false;
    }
  }
});