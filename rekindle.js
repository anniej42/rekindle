if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to rekindle.";
  };

  Template.Hello.events({
    'click button': function () {
      // template data, if any, is available in 'this'
      // var h = $('#' + event.currentTarget.id);

      $.scrollTo( '#' + event.currentTarget.id, 500);

    }


  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code ran on server startup
    
  });
}
