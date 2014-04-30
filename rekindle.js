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
  
    Bonfires = new Meteor.Collection('bonfires');
    Messages = new Meteor.Collection('messages');
    Memberships = new Meteor.Collection('memberships');

if (Meteor.isClient) {



  Template.bonfires.items = function(){
    return Bonfires.find({},{sort:{'submittedOn':-1}})
  }

  Template.bonfires.yours = function(){
    allYourBonfires = Memberships.find(
      {user_id:Meteor.userId()},
      {fields:{user_id: 0}}).fetch()
    //console.log(allYourBonfires)
    allYourBonfireIds=[]
    for(var i=0;i<allYourBonfires.length;i++){
      allYourBonfireIds.push(allYourBonfires[i].bonfire_id)
    }
    //console.log(allYourBonfireIds)
    output=Bonfires.find({_id:{$in: allYourBonfireIds}})

    return output
  }

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

  Template.bonfireShow.helpers({
    name: function(id){
      return Meteor.users.findOne({_id:id}).profile.name},
    company: function(id){
      return Meteor.users.findOne({_id:id}).profile.company},
    school: function(id){
      return Meteor.users.findOne({_id:id}).profile.school},
    school_toyear:function(id){
      return Meteor.users.findOne({_id:id}).profile.school_toyear},
  });

  Template.message.helpers({
    name: function(id){
      //console.log(Meteor.users.findOne({_id:id}))
      return Meteor.users.findOne({_id:id}).profile.name},
    timestamp: function(){
      return this.date
    },
    is_mine: function(message_id){
      output=Meteor.userId()==Messages.findOne({_id:message_id}).user_id
      return output
    }
  });

  Template.reply.helpers({
    name: function(id){
      //console.log(Meteor.users.findOne({_id:id}))
      return Meteor.users.findOne({_id:id}).profile.name},
    timestamp: function(){
      return this.date
    },
    is_mine: function(message_id){
      output=Meteor.userId()==Messages.findOne({_id:message_id}).user_id
      return output
    }
  });


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

  Template.bonfireShow.messages = function(){
    var parents = Messages.find({parent_id:{$exists: false},bonfire_id:this._id},{sort: {date: -1}}).fetch()

    for(var i=0;i<parents.length;i+=1){
      var pId=parents[i]['_id']
      var replies = Messages.find({parent_id:pId},{sort: {date: -1}})
      parents[i]['replies']=replies
    }
    return parents

  }
  // Template.hello.greeting = function () {
  //   return "Welcome to rekindle.";
  // };
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

  Template.welcome.events({
    'click .button': function (e) {
      // template data, if any, is available in 'this'
      // var h = $('#' + event.currentTarget.id);

      // $.scrollTo( '#' + e.target.id, 500);
      // formerize
      var tar = e.target;
      $('html, body').animate({
        scrollTop: $(tar.getAttribute('href')).offset().top
      }, 800);

    }
  });

  Template.signup.events({
    'click .button': function (e) {
      // template data, if any, is available in 'this'
      // var h = $('#' + event.currentTarget.id);

      // $.scrollTo( '#' + e.target.id, 500);
      // formerize
      // var tar = e.target;
      // $('html, body').animate({
      //   scrollTop: $(tar.getAttribute('href')).offset().top
      // }, 800);

    },
    'click #GoButton': function(e){
      var profile={
        name : $('[name="name"]').val(),
        email : $('[name="email"]').val(),
        company : $('[name="company"]').val(),
        title : $('[name="title"]').val(),
        school : $('[name="school"]').val(),
        major : $('[name="major"]').val(),
        zip : $('[name="zip"]').val(),
        company_fromyear : $('[name="fromYearWork"]').val(),
        company_toyear : $('[name="toYearWork"]').val(),
        school_fromyear : $('[name="fromYearSchool"]').val(),
        school_toyear : $('[name="toYearSchool"]').val(),


      }
      Meteor.call("setProfile",Meteor.userId(),profile)
    }
  });

  // Template.bonfires.events({
  //   'click .goToBonfire': function (e) {
  //     console.log("trying to scrolllll");
  //     var tar = e.target;
  //     $('html, body').animate({
  //       scrollTop: $(tar.getAttribute('href')).offset().top
  //     }, 800);
  //   }
  // })

  Template.bonfires.events({
    'click #gotit':function(){
      $('#bonfires_helptext').css('display','none')
    },
    'click .addNewBonfire':function(){
      $('#newBonfire').css('visibility','visible')
      $('#newBonfire').css('z-index',1)
      // display popover window
    },
    'click #create-bonfire-button':function(){
      $('#newBonfire').css('visibility','hidden')
      $('#newBonfire').css('z-index',-1)
      // get the fields
      name=$("#newBonfireName").val()
      desc = $("#newBonfireDescription").val()
      image = $("#newBonfireImage").val()
      $("#newBonfireName").val("")
      $("#newBonfireDescription").val("")
      $("#newBonfireImage").val("")
      console.log(name,desc,image)
      Meteor.call("addBonfire",name,desc,image)

    },
    'click #exitNewBonfire':function(){
      $('#newBonfire').css('visibility','hidden')
      $('#newBonfire').css('z-index',-1)
    }
  });

  // Template.stanford85.events({
  //   'click #joinleave': function(e) {
  //     console.log("shit happened");
  //     var textfields = $('.toggle');
  //     if ($(e.target).text() == "Join") {
  //       $(e.target).text("Leave");
  //       // console.log("leaving");
  //       textfields.prop('disabled', false);
  //       // textarea.prop('background-color',"#fff");
  //     } else {
  //       $(e.target).text("Join");
  //       console.log("joining");
  //       textfields.prop('disabled', true);
  //       // textarea.prop('background-color','gray');
  //     }
  //     syntaxerror;
  //   }
  // });



  // Template.stanford85.events({
  //   'click #newpost-button': function(e) {
  //     var text = $("#newpost-textfield").val();
  //     var newPost = '<div class="post"><div class="icon"></div><div class="post-text"><b>Your name - Today</b><br>' + text + '</div></div>';
  //     var newReply = '<div class="post reply"><textarea rows="2" class="toggle reply-textfield" name="reply-text" placeholder="Reply..."></textarea><div class="spacing"><button type="button" class="button reply-button">Reply</button></div></div>';
  //     var newBlock = newPost + newReply;

  //     if (text == "") {
  //       // Do nothing
  //     } 
  //     else {
  //       $("#posts").prepend(newBlock);
  //     }
  //     $("#newpost-textfield").val("");
  //     e.stopPropagation();
  //     e.preventDefault();
  //     syntaxerror;

  //   }
  // });

  Template.message.events({
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
    'click .deleteMessage':function(e){
      // delete this message and all replies to it
      Meteor.call("deleteMessage",this._id)
      console.log("deleted")
    }
  })

  Template.reply.events({
    'click .deleteMessage':function(e){
      Meteor.call("deleteMessage",this._id)
    }
  })

  Template.bonfireShow.events({
    'click #joinleave': function(e) {
      console.log("shit happened",e);
      var textfields = $('.toggle');
      var user_id = Meteor.userId()
      bonfire_id=this._id
      console.log(user_id, this._id)
      Meteor.call('toggleMember',user_id,bonfire_id,function(f,data){
        console.log(f,data)
        if (data) {
          //$(e.target).text("Leave");
          console.log("should say leave")
          //textfields.prop('disabled', false);
        } else {
          //$(e.target).text("Join");
          //textfields.prop('disabled', true);
        }

      })
        

    },
    'click #newpost-button': function(e) {
      var text = $("#newpost-textfield").val();
      console.log("client:",text)
      
      // var text = $("#newpost-textfield").val();
      // var newPost = '<div class="post"><div class="icon"></div><div class="post-text"><b>Your name - Today</b><br>' + text + '</div></div>';
      // var newReply = '<div class="post reply"><textarea rows="2" class="toggle reply-textfield" name="reply-text" placeholder="Reply..."></textarea><div class="spacing"><button type="button" class="button reply-button">Reply</button></div></div>';
      // var newBlock = newPost + newReply;

      if (text == "") {
        // Do nothing
      } 
      else {
        var bonfireId = this._id
        var userId = Meteor.userId()
        Meteor.call('postMessage',text,bonfireId,userId)
      }
      $("#newpost-textfield").val("");
      // e.stopPropagation();
      // e.preventDefault();
      // syntaxerror;

    }

  });

  // Template.stanford85.events({
  //   'click .reply-button': function(e) {
  //     var text = $(".reply-textfield").val();
  //     var newPost = '<div class="post"><div class="icon"></div><div class="post-text"><b>Your name - Today</b><br>' + text + '</div></div>';

  //     if (text == "") {
  //       // Do nothing
  //     } 

  //     else {
  //       $("#posts").prepend(newPost);
  //     }

  //     $("#newpost-textfield").val("");
  //     e.stopPropagation();
  //     e.preventDefault();
  //     syntaxerror;

  //   }
  // });

} // end isClient

if (Meteor.isServer) {


  Meteor.startup(function () {

    // code ran on server startup
  });

  Meteor.methods({
    addBonfire: function(bonfireName,bonfireDescription,bonfireImage){
      bonfireId=Bonfires.insert({
        'bonfireName': bonfireName,
        'bonfireDescription':bonfireDescription,
        'bonfireImage': bonfireImage
      })
      return bonfireId
    },
    toggleMember: function(userId,bonfireId){
      // returns True if the user is now in the bonfire
      // False if the user is now not in the bonfire
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

      //parentId can be null if this is a top-level message
    },
    deleteMessage: function(deleteId){
      message=Messages.findOne({_id:deleteId})
      if(message.parent_id){// just delete this guy
        Messages.remove(deleteId)

      }else{// this is a top-level message, must delete all its children
        Messages.remove(deleteId)
        Messages.remove({parent_id: deleteId})
      }
    },
    setProfile: function(userId,profileIn){
      Meteor.users.update({_id:userId},{$set:{profile:profileIn}})
    }
  });



} // end isServer
