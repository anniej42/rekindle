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

  Template.stanford85.events({
    'click #joinleave': function(e) {
      console.log("shit happened");
      var textfields = $('.toggle');
      if ($(e.target).text() == "Join") {
        $(e.target).text("Leave");
        console.log("leaving");
        textfields.prop('disabled', false);
      } else {
        $(e.target).text("Join");
        console.log("joining");
        textfields.prop('disabled', true);
      }
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code ran on server startup
  });
}
