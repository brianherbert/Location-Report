// 1 hour - 3600000 ms
// 30 minutes - 1800000 ms

var LocationUpdateCron = new Cron(Meteor.settings.updateCronTimer);

// number of times the job happens, so this job will happen once every minute
LocationUpdateCron.addJob(1, function() {
  var users = Meteor.users.find().fetch();
  _.each(users, function(user){
    Meteor.call('updateTweetGeo',user._id,function(err, data){
        // Updating Tweet Geo Complete
    });
    Meteor.call('updateInstagramGeo',user._id,function(err, data){
      // Updating Instagram Geo Complete
    });
  });
});