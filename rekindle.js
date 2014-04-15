if (Meteor.isClient) {
  // Template.hello.greeting = function () {
  //   return "Welcome to rekindle.";
  // };

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

  // toggle join/leave button
  // misbehaving :()
  $("#joinleave").click(function(){
    if ($(this).text() == "Join") {
      $(this).text("Leave");
    } else {
      $(this).text("Join");
    }
  });  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code ran on server startup
  });
}
