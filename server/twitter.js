Twit = new TwitMaker({
    consumer_key:         '',
    consumer_secret:      '',
    access_token:         '',
    access_token_secret:  ''
});

Meteor.startup(function () {
  Future = Npm.require('fibers/future');
  // use Future here
});

Meteor.methods({
  update_tweet_geo: function () {
    var fut = new Future();
    var screen_name = Meteor.user().profile.twitterHandle;

    //Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.geo.service":"twitter"}});

    if(screen_name === undefined) {
      return false;
    }

    Twit.get('statuses/user_timeline', { screen_name: screen_name, include_rts: false, count: 200 }, function(err, tweets) {
      var i;
      for (i = 0; i < tweets.length; ++i) {
        if(tweets[i].geo != null) {
          var geo = {lat: tweets[i].geo.coordinates[0], lon: tweets[i].geo.coordinates[1]};
          fut['return'](geo);
          return;
        }
      }
    });
    return fut.wait();
  }
});
