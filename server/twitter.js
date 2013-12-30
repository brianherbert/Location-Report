Meteor.startup(function () {
  Future = Npm.require('fibers/future');
  Twit = new TwitMaker(Meteor.settings.services.twitter);
});

Meteor.methods({
  updateTweetGeo: function (userId) {

    console.log('Update from Twitter');

    var fut = new Future();
    var screen_name = Meteor.users.findOne({_id:userId}).profile.twitterHandle;

    if(screen_name === undefined) {
      return false;
    }

    // Callback for when we call Twit.get() below
    var twitResponse = Meteor.bindEnvironment(function(err, tweets){
      var i;
      for (i = 0; i < tweets.length; ++i) {
        if(tweets[i].geo != null) {
          var geo = {lat: tweets[i].geo.coordinates[0], lon: tweets[i].geo.coordinates[1]};
          var data = {geo:geo, since_id:tweets[i].id, timestamp: moment(tweets[i].created_at).format('X')};
          Meteor.call('updateLocation', userId, 'twitter', data, function (error, result) {
            //console.log('Should have updated with Twitter by now.');
          });

          fut['return'](geo);
          return;
        }
      }
      fut['return'](false);
      return;
    }, function(e) {
      throw e;
    });

    var params = {screen_name: screen_name, include_rts: false, count: 200, trim_user: true };

    // Check if we need to limit our results by the last found
    var loc = Locations.findOne({_id:userId});
    if(loc !== undefined && loc.twitter !== undefined && loc.twitter.since_id !== undefined) {
      params['since_id'] = loc.twitter.since_id;
    }

    Twit.get('statuses/user_timeline', params, twitResponse);

    return fut.wait();
  }
});

