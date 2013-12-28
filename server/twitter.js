Meteor.startup(function () {
  Future = Npm.require('fibers/future');
  Twit = new TwitMaker(Meteor.settings.services.twitter);
});

Meteor.methods({
  updateTweetGeo: function () {
    var fut = new Future();
    var screen_name = Meteor.user().profile.twitterHandle;

    if(screen_name === undefined) {
      return false;
    }

    var twitResponse = Meteor.bindEnvironment(function(err, tweets){
      var i;
      for (i = 0; i < tweets.length; ++i) {
        if(tweets[i].geo != null) {
          var geo = {lat: tweets[i].geo.coordinates[0], lon: tweets[i].geo.coordinates[1]};
          var data = {geo:geo, since_id:tweets[i].id, timestamp: moment(tweets[i].created_at).format('X')};
          Meteor.call('updateLocation', 'twitter', data, function (error, result) {
            //console.log('Should have updated with Twitter by now.');
          });

          fut['return'](geo);
          return;
        }
      }
      //console.log('Did not find anything :(');
      fut['return'](false);
      return;
    }, function(e) {
      throw e;
    });

    var params = {screen_name: screen_name, include_rts: false, count: 200, trim_user: true };

    // Check if we need to limit our results by the last found
    var loc = Locations.findOne({_id:Meteor.user()._id});
    if(loc !== undefined && loc.twitter !== undefined && loc.twitter.since_id !== undefined) {
      params['since_id'] = loc.twitter.since_id;
    }

    Twit.get('statuses/user_timeline', params, twitResponse);

    return fut.wait();
  }
});

