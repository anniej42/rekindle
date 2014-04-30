/*****************
      Routing
*****************/
Router.map(function() {
  this.route('about');
  this.route('bonfires');
  this.route('signup');
  this.route('stanford85');
  this.route('welcome',{path:'/'});
  this.route('bonfireShow',{
    path:'/bonfires/:_id',
    data: function(){return Bonfires.findOne(this.params._id); }
  })
});

/*****************
      Collections
******************
Where the data is stored
*/

Bonfires = new Meteor.Collection('bonfires');
Messages = new Meteor.Collection('messages');
Memberships = new Meteor.Collection('memberships');
// also accessible: Meteor.users


/********************************
      Client Code
*********************************/

if (Meteor.isClient) {

  /*****************
      Menu
  *****************/  
  var menuactivated=false
  Template.menu.events({
    'click .navHeading': function(e){
      if(menuactivated){
        $('.navDropDown').css("visibility","hidden");
        menuactivated=false
      }else{
        $('.navDropDown').css("visibility","visible");
        menuactivated=true
      }
    },
    'click .navDropDown': function(e){
      menuactivated=false
      $('.navDropDown').css("visibility","hidden");
    }
  })

  /***********************
      All bonfires page
  ************************/  

  // items is the list of all bonfires
  Template.bonfires.items = function(){
    return Bonfires.find({},{sort:{'submittedOn':-1}})
  }

  // yours is the list of all your bonfires
  Template.bonfires.yours = function(){
    allYourBonfires = Memberships.find(
      {user_id:Meteor.userId()},
      {fields:{user_id: 0}}).fetch()

    allYourBonfireIds=[]
    for(var i=0;i<allYourBonfires.length;i++){
      allYourBonfireIds.push(allYourBonfires[i].bonfire_id)
    }

    output=Bonfires.find({_id:{$in: allYourBonfireIds}})

    return output
  }

  // events on the all bonfires page
  Template.bonfires.events({

    // remove the help text div
    'click #gotit':function(){
      $('#bonfires_helptext').css('display','none')
    },

    // display the popover window for adding a new bonfire
    'click .addNewBonfire':function(){
      $('#newBonfire').css('visibility','visible')
      $('#newBonfire').css('z-index',1)
    },

    // create a new bonfire from the popover box
    'click #create-bonfire-button':function(){

      // get the fields
      name=$("#newBonfireName").val()
      desc = $("#newBonfireDescription").val()
      image = $("#newBonfireImage").val()

      // clear the fields 
      $("#newBonfireName").val("")
      $("#newBonfireDescription").val("")
      $("#newBonfireImage").val("")

      // create the bonfire
      Meteor.call("addBonfire",name,desc,image)

      // remove the input box
      // TODO: add feedback
      $('#newBonfire').css('visibility','hidden')
      $('#newBonfire').css('z-index',-1)

    },

    // exit the new bonfire popover without saving the bonfire
    // also does not destroy text you've entered so far
    // user safety and control
    'click #exitNewBonfire':function(){
      $('#newBonfire').css('visibility','hidden')
      $('#newBonfire').css('z-index',-1)
    }
  });


  /***********************
      Single bonfire page
  ************************/ 


  // the correct text for the join/leave button as detected from the data
  Template.bonfireShow.status = function(){
    mem = Memberships.findOne({user_id:Meteor.userId(),bonfire_id:this._id})
          var textfields = $('.toggle');
    if(mem){// user is in this bonfire!
      textfields.prop('disabled', false);
      return "Leave"
    }else{
      textfields.prop('disabled', true);
      return "Join"
    }
  }

  // all the members of this bonfire
  Template.bonfireShow.members = function(){
    allMemberships=Memberships.find(
      {bonfire_id:this._id},
      {fields:{bonfire_id: 0}}).fetch()
    allMemberIds=[]
    for(var i=0;i<allMemberships.length;i++){
      allMemberIds.push(allMemberships[i].user_id)
    }
    return Meteor.users.find({_id:{$in: allMemberIds}})
  }

  // for accessing members' profile data to be displayed
  Template.bonfireShow.helpers({
    name: function(id){
      return Meteor.users.findOne({_id:id}).profile.name},
    company: function(id){
      console.log(Meteor.users.findOne({_id:id}).profile.companies)
      return Meteor.users.findOne({_id:id}).profile.companies[0].name},
    school: function(id){
      return Meteor.users.findOne({_id:id}).profile.schools[0].name},
    school_toyear:function(id){
      return Meteor.users.findOne({_id:id}).profile.schools[0].toyear},
  });

  // gets the list of all messages to display on the bonfire page
  // messages replies are grouped with that message
  Template.bonfireShow.messages = function(){
    var parents = Messages.find({parent_id:{$exists: false},bonfire_id:this._id},{sort: {date: -1}}).fetch()

    for(var i=0;i<parents.length;i+=1){
      var pId=parents[i]['_id']
      var replies = Messages.find({parent_id:pId},{sort: {date: -1}})
      parents[i]['replies']=replies
    }
    return parents

  }

  // all general bonfire page events
  Template.bonfireShow.events({

    // join or leave the bonfire
    'click #joinleave': function(e) {
      Meteor.call('toggleMember',Meteor.userId(),this._id)
    },

    // maek a new post
    'click #newpost-button': function(e) {
      var text = $("#newpost-textfield").val();

      if (text == "") {
        // If no post, do nothing
        // can't make an empty post
      } 
      else {
        var bonfireId = this._id
        var userId = Meteor.userId()
        Meteor.call('postMessage',text,bonfireId,userId)
      }
      // clear newpost field
      $("#newpost-textfield").val("");
    }
  });


  /***********************
        Message
  ************************/ 

  // Get the correct data to display in the message template
  Template.message.helpers({
    name: function(id){
      return Meteor.users.findOne({_id:id}).profile.name},
    timestamp: function(){
      return this.date
    },
    is_mine: function(message_id){
      output=Meteor.userId()==Messages.findOne({_id:message_id}).user_id
      return output
    }
  });

  // all message events
  Template.message.events({

    // reply to a message
    'click .reply-button':function(e){
      var text = $("#reply-textfield-"+this._id).val();
      if (text == "") {
        // Do nothing
      } 
      else {
        var userId = Meteor.userId()
        var parentId = this._id
        Meteor.call('postMessage',text,null,userId,parentId)
      }
      $("#reply-textfield-"+this._id).val("");
    }, 

    // delete a message
    'click .deleteMessage':function(e){
      // delete this message and all replies to it
      Meteor.call("deleteMessage",this._id,Meteor.userId())
    }
  })

  /***********************
        Reply
  ************************/ 

  // get the correct data to display in the reply template
  Template.reply.helpers({
    name: function(id){
      return Meteor.users.findOne({_id:id}).profile.name},
    timestamp: function(){
      return this.date
    },
    is_mine: function(message_id){
      output=Meteor.userId()==Messages.findOne({_id:message_id}).user_id
      return output
    }
  });

  // all reply events
  Template.reply.events({
    // delete a reply
    'click .deleteMessage':function(e){
      Meteor.call("deleteMessage",this._id,Meteor.userId())
    }
    // no more methods here -- you can't reply to a reply
  })



  /***********************
        Signup
  ************************/ 

  Template.signup.helpers({
  })

  Template.signup.events({
    // add the user's profile info when they click go
    'click #GoButton': function(e){
      var profile={
        name : $('[name="name"]').val(),
        email : $('[name="email"]').val(),
        zip : $('[name="zip"]').val(),
        companies: [// a list of all the companies
          {
            name:$('[name="company"]').val(),
            title:$('[name="title"]').val(),
            fromyear : $('[name="fromYearWork"]').val(),
            toyear : $('[name="toYearWork"]').val(),
          },
        ],
        schools: [
          {
            name: $('[name="school"]').val(),
            major : $('[name="major"]').val(),
            fromyear : $('[name="fromYearSchool"]').val(),
            toyear : $('[name="toYearSchool"]').val(),
          },
        ],
      }
      Meteor.call("setProfile",Meteor.userId(),profile)
    }
  });

}



/********************************
      Server Code
*********************************/

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code ran on server startup
    // nothing here yet!
  });

  Meteor.methods({
    // adds a bonfire
    // returns the bonfireId
    addBonfire: function(bonfireName,bonfireDescription,bonfireImage){
      bonfireId=Bonfires.insert({
        'bonfireName': bonfireName,
        'bonfireDescription':bonfireDescription,
        'bonfireImage': bonfireImage
      })
      return bonfireId
    },

    // checks to see whether this user is in the group, and swap
    // if the user is in the bonfire, removes them and returns false
    // if the user is not in the bonfire, adds them and returns true
    toggleMember: function(userId,bonfireId){
      membership = Memberships.findOne({user_id:userId,bonfire_id:bonfireId})
      console.log(membership)
      if(membership){ // user is already a member
        Memberships.remove(membership)
        console.log('removed a membership');
        return false;
      }else{
        Memberships.insert({
          user_id: userId,
          bonfire_id: bonfireId
        })
        console.log('added a membership');
        return true;
      }
    },

    // adds a message
    // if parentId is not specified, the message is a top level message
    // otherwise it's a reply
    postMessage: function(text,bonfireId,userId,parentId){
      var messageId
      if(parentId){
        messageId=Messages.insert({
          'bonfire_id':bonfireId,
          'parent_id':parentId,
          'user_id': userId,
          'text':text,
          'date': new Date()
        })
      }else{
        messageId=Messages.insert({
          'date': new Date(),
          'bonfire_id':bonfireId,
          'user_id': userId,
          'text':text
        })
      }
      return messageId
    },

    // delete a message
    // this message can only be deleted if the person trying to delete it
    // is the same person who created it
    deleteMessage: function(deleteId,userId){
      message=Messages.findOne({_id:deleteId})
      if(message.user_id == userId){
        if(message.parent_id){
          Messages.remove(deleteId)

        }else{// this is a top-level message, must delete all its children
          Messages.remove(deleteId)
          Messages.remove({parent_id: deleteId})
        }
      }

    },

    // server side code for setting the user's profile
    setProfile: function(userId,profileIn){
      Meteor.users.update({_id:userId},{$set:{profile:profileIn}})
    }
  });



} // end isServer
