Router.map(function() {
  this.route('about');
  this.route('bonfires');
  this.route('signup');
  this.route('stanford85');
  this.route('welcome',{path:'/'});
});

if (Meteor.isClient) {
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
    }
  });

  Template.stanford85.events({
    'click #joinleave': function(e) {
      console.log("shit happened");
      var textfields = $('.toggle');
      if ($(e.target).text() == "Join") {
        $(e.target).text("Leave");
        // console.log("leaving");
        textfields.prop('disabled', false);
        // textarea.prop('background-color',"#fff");
      } else {
        $(e.target).text("Join");
        console.log("joining");
        textfields.prop('disabled', true);
        // textarea.prop('background-color','gray');
      }
      syntaxerror;
    }
  });

  Template.stanford85.events({
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

} // end isServer
