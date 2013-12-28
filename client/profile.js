Template.profile.latest = function () {
  var loc = Locations.findOne({_id:Meteor.user()._id});
  if(loc === undefined) {
    loc = {latest:{geo:{lat:0,lon:0},timestamp:0,service:null}};
  }
  return loc.latest;
};


// Update a user profile
Template.profile.events({
  'click button.updateProfile' : function () {
    var name            = document.getElementById("updateProfileName").value;
    var twitterHandle   = document.getElementById("updateTwitterHandle").value;
    var instagramHandle = document.getElementById("updateInstagramHandle").value;

    var data = {"profile.name":name,
                "profile.twitterHandle":twitterHandle,
                "profile.instagramHandle":instagramHandle
              }

    // Make sure we aren't setting the Instagram User ID if we don't have an instagram handle anymore.
    if(!instagramHandle){
      data["profile.instagramUserId"] = "";
    }

    Meteor.users.update({_id:Meteor.user()._id}, {$set:data});

    if(instagramHandle) {
      Meteor.call('updateInstagramUserId',function(err, data){
        console.log('Finished updating users Instagram user ID');
      });
    }

    $('button.updateProfile').addClass('btn-success');
    $('button.updateProfile').text('Profile Saved!');
    Meteor.setTimeout(function(){
      console.log('clear it.');
      $('button.updateProfile').removeClass('btn-success');
      $('button.updateProfile').text('Update Profile');
    },2000);

  },
  'click input.updateLocation' : function () {
    Meteor.call('updateTweetGeo',function(err, data){
      // Updating Tweet Geo Complete
    });
    Meteor.call('updateInstagramGeo',function(err, data){
      // Updating Instagram Geo Complete
    });
  }
});