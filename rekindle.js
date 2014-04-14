if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to rekindle.";
  };

  Template.Hello.events({
    'click button': function () {
      // template data, if any, is available in 'this'
      var h = jQuery(this).attr('href'), target;

        if (h.charAt(0) == '#' && h.length > 1 && (target = jQuery(h)).length > 0)
        {
          var pos = Math.max(target.offset().top, 0);
          e.preventDefault();
          bh
            .stop(true, true)
            .animate({ scrollTop: pos }, 'slow', 'swing');
        }

    }


  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code ran on server startup
    
  });
}
