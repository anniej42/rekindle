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
    Replies = new Meteor.Collection('replies');
    Memberships = new Meteor.Collection('memberships')

if (Meteor.isClient) {



  Template.bonfires.items = function(){
    return Bonfires.find({},{sort:{'submittedOn':-1}})
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
      var tar = e.target;
      $('html, body').animate({
        scrollTop: $(tar.getAttribute('href')).offset().top
      }, 800);

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
          $(e.target).text("Leave");
          console.log("should say leave")
          textfields.prop('disabled', false);
        } else {
          $(e.target).text("Join");
          textfields.prop('disabled', true);
        }

      })
        

    },
    'click #newpost-button': function(e) {
      var text = $("#newpost-textfield").val();
      var newPost = '<div class="post"><div class="icon"></div><div class="post-text"><b>Your name - Today</b><br>' + text + '</div></div>';
      var newReply = '<div class="post reply"><textarea rows="2" class="toggle reply-textfield" name="reply-text" placeholder="Reply..."></textarea><div class="spacing"><button type="button" class="button reply-button">Reply</button></div></div>';
      var newBlock = newPost + newReply;

      if (text == "") {
        // Do nothing
      } 
      else {
        $("#posts").prepend(newBlock);
      }
      $("#newpost-textfield").val("");
      e.stopPropagation();
      e.preventDefault();
      syntaxerror;

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
      console.log("got here!")
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
    }
  });



} // end isServer
