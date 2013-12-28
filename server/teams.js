Teams = new Meteor.Collection("teams");

Meteor.startup(function () {
  Future = Npm.require('fibers/future');
});

Meteor.methods({
  inviteToTeam: function (teamId, email) {

    console.log('************ '+email+' ************');

    var user = Meteor.users.findOne({'emails.address': email});

    if (user === undefined) {
      console.log('TODO: User is undefined. Send invite email.');
      return;
    }

    if (Meteor.user()._id == user._id) {
      console.log('This is the logged in user. Do not bother adding');
      return;
    }

    Teams.update({_id:teamId},
                 {$push:
                  {members: user._id}
                 });
    return;
  }
});

