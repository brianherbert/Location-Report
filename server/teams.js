Teams = new Meteor.Collection("teams");

Teams.allow({
  insert: function (userId, team) {
    // Allow anyone to create a team if it hasn't already been created

    if(Teams.find({_id : team._id}).count() > 0) {
      console.log('Team already exists');
      return false;
    }

    return true;
  },
  update: function (userId, team) {
    // Don't allow updates from the client side since they are done in methods for now
    return false;
  }
});

Meteor.publish("teams", function () {
  return Teams.find({members:this.userId});
});



Meteor.methods({
  inviteToTeam: function (teamId, email) {

    console.log('************ '+email+' ************');

    var tm = Teams.findOne({'_id':teamId});
    if(!tm) {
      console.log('This is not a valid team to add a person to');
      return false;
    }

    if (Meteor.user()._id != tm.adminId) {
      console.log('User is not an admin so cannot add member to team');
      return false;
    }

    var user = Meteor.users.findOne({'emails.address': email});

    if (user === undefined) {
      console.log('TODO: User is undefined. Send invite email.');




      Email.send({
        to: email,
        from: Meteor.settings.emailAddress,
        subject: 'Join our team on '+Meteor.settings.title,
        text: 'You are a hippy.'
      });




      return;
    }

    if (Meteor.user()._id == user._id) {
      console.log('This is the logged in user. Do not bother adding');
      return false;
    }

    if(_.indexOf(tm.members, user._id) > 0) {
      console.log('This person is already on the team');
      return false;
    }

    Teams.update({_id:teamId},
                 {$push:
                  {members: user._id}
                 });
    return;
  },
  removeMember: function(teamId, userId){
    var tm = Teams.findOne({'_id':teamId});
    if(!tm) {
      console.log('This is not a valid team to remove a person from');
      return false;
    }

    if (Meteor.user()._id != tm.adminId) {
      console.log('User is not an admin so cannot remove member from a team');
      return false;
    }
    Teams.update({_id: teamId}, {$pull : {members : userId}});
  }
});

