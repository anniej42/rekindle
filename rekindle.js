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
  });
  this.route('userShow',{
    path:'/users/:_id',
    data: function(){return Meteor.users.findOne(this.params._id); }
  });
  this.route('bonfireMap',{
    path:'/bonfires/:_id/map',
    data: function(){return {_id: this.params._id}; }
  });
});

/*****************
      Collections
******************
Where the data is stored
*/

Bonfires = new Meteor.Collection('bonfires');
Messages = new Meteor.Collection('messages');
Memberships = new Meteor.Collection('memberships');
var Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {path: "./uploads"})]
});
// also accessible: Meteor.users


/********************************
      Client Code
*********************************/

if (Meteor.isClient) {
  /*****************
      Navigation
  *****************/  

  var getPageURL = function() {
    var current_url = window.location.href + "";
    var url_array = current_url.split("/");
    var url_page = url_array.pop();
    return url_page;
  }

  var resetActiveLinks = function() {
    document.getElementById("bonfires").className = "";
    document.getElementById("signup").className = "";
    document.getElementById("about").className = "";
  }

  Template.menu.events({
    'click .nav': function(e) {
      var link = e.target.id;
      resetActiveLinks();

      if (link == "bonfirespage") {
        document.getElementById("bonfires").className = "active";
      }
      else if (link == "signuppage") {
        document.getElementById("signup").className = "active";
      }
      else if (link == "aboutpage") {
        document.getElementById("about").className = "active";
      }
      else if (link == "welcomepage") {
        console.log("here");
        resetActiveLinks();
      }
    }
  })

  // Reset scroll to top of the page when navigating to new page
  Deps.autorun(function () {
    var current = Router.current();

    Deps.afterFlush(function () {
      $('.content-inner').scrollTop(0);
      $(window).scrollTop(0);
    });
  });

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

  Template.bonfires.predicted = function(){
    thisUser=Meteor.users.findOne({_id:Meteor.userId()})
    if(thisUser.profile){
      // construct a regex for fuzzy matching a school name or company name
      regex=""
      for(var i=0;i<thisUser.profile.schools.length;i++){
        thisname=thisUser.profile.schools[i].name
        if(thisname != ""){
          regex+=".*"+thisname+".*|"
        }
      }
      for(var i=0;i<thisUser.profile.companies.length;i++){
        thisname=thisUser.profile.companies[i].name
        if(thisname != ""){
          regex+=".*"+thisname+".*|"
        }
      }
      regex = regex.slice(0,-1)
      if(regex==""){ // nothing to search for? we should return no results
        return []
      }
      var search = new RegExp(regex,'i')
      // don't include bonfires the user is already in
      thisUsersBonfires=Memberships.find(
        {user_id:Meteor.userId()},
        {fields:{user_id: 0}}).fetch()

      thisUsersBonfireIds=[]
      for(var i=0;i<thisUsersBonfires.length;i++){
        thisUsersBonfireIds.push(thisUsersBonfires[i].bonfire_id)
      }

      // construct the query: bonfires the user is not in, which match the search term
      output=Bonfires.find(
          {$and: 
            [
              {_id:{$nin:thisUsersBonfireIds}},
              {$or: [
                {bonfireName: {$regex: search}},
                {bonfireDescription:{$regex: search}}]}
            ]
          }
        )
      return output
    }else{// without a profile we can't predict any bonfires
      return []
    }
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

  Template.bonfires.helpers({
    // should we display the help text?
    'userNeedsHelp':function(){
      thisUser=Meteor.users.findOne({_id:Meteor.userId()})
      if(thisUser && thisUser.profile && thisUser.profile.understandsBonfires){
        return false
      }else{
        return true
      }
    },
  })

  // events on the all bonfires page
  Template.bonfires.events({

    // record that we don't need to display the help text div
    'click #gotit':function(){
      Meteor.call("userUnderstandsBonfires",Meteor.userId())
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

  Template.bonfireShow.rendered = function() {
    var h = this.$("#posts").height();
    this.$("#memberslist").height(h);
  }


  // the correct text for the join/leave button as detected from the data
  Template.bonfireShow.member = function(){
    mem = Memberships.findOne({user_id:Meteor.userId(),bonfire_id:this._id})
          //var textfields = $('.toggle');
    if(mem){// user is in this bonfire!
      //textfields.prop('disabled', false);
      return true
    }else{
      //textfields.prop('disabled', true);
      return false
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
      userProf=Meteor.users.findOne({_id:id}).profile
      if(userProf){
        return userProf.name=="" ? "Anonymous User" : userProf.name
      }else{
        return "Anonymous User"
      }
    },
    summary: function(id){
      userProf=Meteor.users.findOne({_id:id}).profile
      if(userProf){
        var company
        if(userProf.companies[0]){
          company=userProf.companies[0].name
        }else{
          company=""
        }
        var school
        var year;
        if(userProf.schools[0]){
          school=userProf.schools[0].name
          year = userProf.schools[0].toyear
        }else{
          year=""
          school=""
        }

        var output=company+" | "+ school + " " + year
        if(company==""){
          output=school+" "+year
        }else if(school==""){
          output=company
        }
        return output

      }else{
        return ""
      }
    },

    prof_pic_image:function(id){
      console.log(id)
      user=Meteor.users.findOne({_id: id})
      console.log(user)
      if(user){
        profile=user.profile
        console.log(profile)
        if(profile){

          var image_id = profile.profile_pic_id
          console.log(image_id)
          if(image_id){
            console.log(Images.findOne({_id:image_id}))
            return Images.findOne({_id:image_id})
          }
        }
      }
      return undefined
    },
    // the following are deprecated and not safe
    company: function(id){
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
    'click .joinleave': function(e) {
      var bool = true;
      if ($(".joinleave").html() == 'Remove Me') {
        bool = confirm("Are you sure you want to leave " + this.bonfireName + "?");
      }
      if (bool) {
        Meteor.call('toggleMember',Meteor.userId(),this._id);
      }
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
      user=Meteor.users.findOne({_id:id})
      if(user && user.profile){
        return user.profile.name
      }
      return "Anonymous User";
    },
    prof_pic_image:function(id){
      console.log("profpicimage in message called",id)
      user=Meteor.users.findOne({_id: id})
      console.log(user)
      if(user){
        profile=user.profile
        console.log(profile)
        if(profile){

          var image_id = profile.profile_pic_id
          console.log(image_id)
          if(image_id){
            console.log(Images.findOne({_id:image_id}))
            return Images.findOne({_id:image_id})
          }
        }
      }
      return undefined
    },
    timestamp: function(){
      if(!this.date){
        return ""
      }
      var day = this.date.getDay();
      switch(day) {
        case 0: 
          d = "Sunday ";
          break;
        case 1:
          d = "Monday ";
          break;
        case 2:
          d = "Tuesday ";
          break;
        case 3:
          d = "Wednesday ";
          break;
        case 4:
          d = "Thursday ";
          break;
        case 5:
          d = "Friday ";
          break;
        case 6:
          d = "Saturday ";
          break;
      }
      var month = this.date.getMonth();
      switch(month){
        case 0:
          m = "Jan. ";
          break;
        case 1:
          m = "Feb. ";
          break;
        case 2:
          m = "Mar. ";
          break;
        case 3:
          m = "Apr. ";
          break;
        case 4:
          m = "May "
          break;
        case 5:
          m = "Jun. "
          break;
        case 6:
          m = "Jul. ";
          break;
        case 7:
          m = "Aug. "
          break;
        case 8: 
          m = "Sept."
          break;
        case 9:
          m = "Oct. ";
          break;
        case 10:
          m = "Nov. ";
          break;
        case 11:
          m = "Dec. ";
          break;
      }
      var min = this.date.getMinutes().toString();
      var hr = this.date.getHours().toString();
      if (min.length == 1) {
        min = "0" + min;
      }
      if (hr.length == 1){
        hr = "0" + hr;
      }
      return m + this.date.getDate() + ", " + this.date.getFullYear() + ", " + hr + ":" + min;
    },
    is_mine: function(message_id){
      output=Meteor.userId()==Messages.findOne({_id:message_id}).user_id
      return output
    },
    member: function(bonfire_id){
      mem = Memberships.findOne({user_id:Meteor.userId(),bonfire_id:bonfire_id})
      if(mem){
        return true
      }else{
        return false
      }
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
      user=Meteor.users.findOne({_id:id})
      if(user && user.profile){
        return user.profile.name
      }
      return "Anonymous User";
    },
    prof_pic_image:function(id){
      console.log(id)
      user=Meteor.users.findOne({_id: id})
      console.log(user)
      if(user){
        profile=user.profile
        console.log(profile)
        if(profile){

          var image_id = profile.profile_pic_id
          console.log(image_id)
          if(image_id){
            console.log(Images.findOne({_id:image_id}))
            return Images.findOne({_id:image_id})
          }
        }
      }
      return undefined
    },
    timestamp: function(){
      if(!this.date){
        return ""
      }
      var day = this.date.getDay();
      switch(day) {
        case 0: 
          d = "Sunday ";
          break;
        case 1:
          d = "Monday ";
          break;
        case 2:
          d = "Tuesday ";
          break;
        case 3:
          d = "Wednesday ";
          break;
        case 4:
          d = "Thursday ";
          break;
        case 5:
          d = "Friday ";
          break;
        case 6:
          d = "Saturday ";
          break;
      }
      var month = this.date.getMonth();
      switch(month){
        case 0:
          m = "Jan. ";
          break;
        case 1:
          m = "Feb. ";
          break;
        case 2:
          m = "Mar. ";
          break;
        case 3:
          m = "Apr. ";
          break;
        case 4:
          m = "May "
          break;
        case 5:
          m = "Jun. "
          break;
        case 6:
          m = "Jul. ";
          break;
        case 7:
          m = "Aug. "
          break;
        case 8: 
          m = "Sept."
          break;
        case 9:
          m = "Oct. ";
          break;
        case 10:
          m = "Nov. ";
          break;
        case 11:
          m = "Dec. ";
          break;
      }
      var day = this.date.getDay();
      switch(day) {
        case 0: 
          d = "Sunday ";
          break;
        case 1:
          d = "Monday ";
          break;
        case 2:
          d = "Tuesday ";
          break;
        case 3:
          d = "Wednesday ";
          break;
        case 4:
          d = "Thursday ";
          break;
        case 5:
          d = "Friday ";
          break;
        case 6:
          d = "Saturday ";
          break;
      }
      var month = this.date.getMonth();
      switch(month){
        case 0:
          m = "Jan. ";
          break;
        case 1:
          m = "Feb. ";
          break;
        case 2:
          m = "Mar. ";
          break;
        case 3:
          m = "Apr. ";
          break;
        case 4:
          m = "May "
          break;
        case 5:
          m = "Jun. "
          break;
        case 6:
          m = "Jul. ";
          break;
        case 7:
          m = "Aug. "
          break;
        case 8: 
          m = "Sept."
          break;
        case 9:
          m = "Oct. ";
          break;
        case 10:
          m = "Nov. ";
          break;
        case 11:
          m = "Dec. ";
          break;
      }
      var min = this.date.getMinutes().toString();
      var hr = this.date.getHours().toString();
      if (min.length == 1) {
        min = "0" + min;
      }
      if (hr.length == 1){
        hr = "0" + hr;
      }
      return m + this.date.getDate() + ", " + this.date.getFullYear() + ", " + hr + ":" + min;
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
  });

  /********************
      Bonfire Map
  ***********************/

  Template.bonfireMap.helpers({
    bonfireName: function (){
      return Bonfires.findOne({_id: this._id}).bonfireName
    },
  })

  Template.bonfireMap.rendered=function(){
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
      center: new google.maps.LatLng(37.759, -122.442),
      scrollwheel:false,
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    members = Memberships.find({bonfire_id:this.data._id}).fetch()

    positions=[]
    done=[]
    for(var i=0;i<members.length;i++){
      thisUser=Meteor.users.findOne({_id:members[i].user_id})
      var lat = '';
      var lng = '';
      if(thisUser && thisUser.profile && thisUser.profile.zip){
        var address = thisUser.profile.zip;
        console.log(address)
        geocoder.geocode( { 'address': address}, function(results, status) {
          done.push("yes")
          if (status == google.maps.GeocoderStatus.OK) {
             lat = results[0].geometry.location.lat();
             lng = results[0].geometry.location.lng();
            console.log('Latitude: ' + lat + ' Logitude: ' + lng);
            positions.push(new google.maps.LatLng(lat, lng))
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(lat, lng),
              icon:'http://i.imgur.com/a9EUtE6.png'
            });
            marker.setMap(map); 
          } else {
            console.log("Geocode was not successful for the following reason: " + status);
          }
          if(done.length==members.length){
            console.log("done!")
            console.log(positions)
            var limits = new google.maps.LatLngBounds();
            for(var i=0;i<positions.length;i++){
              limits.extend(positions[i]);
            }
            console.log("limits coming up!")
            console.log(limits)
            map.fitBounds(limits);
          }
        });
      }else{
        done.push("yes")
      }

    }


  }


  Template.userShow.helpers({
    prof_pic_image:function(){
      user=Meteor.users.findOne({_id: this._id})
      console.log(user)
      if(user){
        profile=user.profile
        console.log(profile)
        if(profile){

          var image_id = profile.profile_pic_id
          console.log(image_id)
          if(image_id){
            console.log(Images.findOne({_id:image_id}))
            return Images.findOne({_id:image_id})
          }
        }
      }
      return undefined
    },
  })


  /***********************
        Signup
  ************************/ 

  Template.signup.helpers({
    prof_pic_image:function(){
      user=Meteor.user()
      if(user){
        profile=user.profile
        if(profile){
          var image_id = profile.profile_pic_id
          if(image_id){
            console.log(Images.findOne({_id:image_id}))
            return Images.findOne({_id:image_id})
          }
        }
      }
      return undefined
    },
  })

  // Template.signup.rendered = function () {
  //   AutoCompletion.init("input#schoolName");
  // }

  Template.signup.events({
    // add the user's profile info when they click go
    'click .saveProfile': function(e){
      comps=[]
      // loop through all visible company input boxes
      company_names=$('[name="company"]')
      company_titles=$('[name="title"]')
      company_fromyears=$('[name="fromYearWork"]')
      company_toyears=$('[name="toYearWork"]')
      for(var i=0;i<company_names.length;i++){
        this_name=company_names[i].value
        this_title=company_titles[i].value
        this_fromyear=company_fromyears[i].value
        this_toyear=company_toyears[i].value
        if(this_name!="" || this_title!="" || this_fromyear!="" || this_toyear!=""){
          // if any of the fields are populated, keep it
          comps.push({
            name: this_name,
            title: this_title,
            fromyear : this_fromyear,
            toyear : this_toyear
          })
        }

      }
      schools=[]

      // loop through all visible school input boxes
      school_names=$('[name="school"]')
      school_majors=$('[name="major"]')
      school_fromyears=$('[name="fromYearSchool"]')
      school_toyears=$('[name="toYearSchool"]')
      for(var i=0;i<school_names.length;i++){
        school=school_names[i].value
        major=school_majors[i].value
        fromyear=school_fromyears[i].value
        toyear=school_toyears[i].value
        if(school!="" || major!="" || fromyear!="" || toyear!=""){
          schools.push({
            name: school,
            major: major,
            fromyear : fromyear,
            toyear : toyear,
          })
        }

      }

      var profile=Meteor.user().profile
      if(!profile){// user doesn't have a profile yet so let's make them one with empty info
        var profile={
          name : $('[name="name"]').val(),
          email : $('[name="email"]').val(),
          zip : $('[name="zip"]').val(),
          companies: [],
          schools: [],
          understandsBonfires:false,
        }
      }
      profile.name=$('[name="name"]').val()
      profile.zip=$('[name="zip"]').val()
      profile.companies=comps
      profile.schools=schools
      
      Meteor.call("setProfile",Meteor.userId(),profile)

    },
    'click #addJob': function(e){
      var profile=Meteor.user().profile
      if(!profile){// user doesn't have a profile yet so let's make them one with empty info
        var profile={
          name : $('[name="name"]').val(),
          email : $('[name="email"]').val(),
          zip : $('[name="zip"]').val(),
          companies: [],
          schools: [],
          understandsBonfires:false,
        }
      }

      profile.companies.push({
        name:null,
        title:null,
        fromyear : null,
        toyear : null,
      })
      

      Meteor.call("setProfile",Meteor.userId(),profile)
    },
    'click #addSchool': function(e){
      var profile=Meteor.user().profile
      if(!profile){// user doesn't have a profile yet so let's make them one with empty info
        var profile={
          name : $('[name="name"]').val(),
          email : $('[name="email"]').val(),
          zip : $('[name="zip"]').val(),
          companies: [],
          schools: [],
          understandsBonfires:false,
        }
      }

      profile.schools.push({
        name:null,
        major:null,
        fromyear : null,
        toyear : null,
      })
      Meteor.call("setProfile",Meteor.userId(),profile)
    },

    // autocomplete school names
    'keyup #schoolName':function(e){


      // AutoCompletion.autocomplete({
      // element: 'input#schoolName',       // DOM identifier for the element
      // collection: uscolleges,              // MeteorJS collection object
      // limit: 0,                         // Max number of elements to show
      // sort: { name: 1 }});              // Sort object to filter results with
      // //filter: { 'gender': 'female' }}); // Additional filtering
    
      console.log("inside listener");
      // var colleges = JSON.parse(Assets.getText('uscolleges.json'));
      colleges = Meteor.call("populateSchools");

      $('#schoolName').autocomplete({
        source: colleges, 
        minLength: 3,
        });
    },
    'click #picUploadButton': function(e){
      $('#profUpload').click();
    },

    'change #profUpload':function(e){
      var user_id=Meteor.userId()
      console.log(user_id)
      files = e.target.files;
      console.log(files);
      for (var i = 0, ln = files.length; i < ln; i++) {
      Images.insert(files[i], function (err, fileObj) {
        console.log(fileObj._id)
        // get this user's profile
        var prof = Meteor.user().profile
        if(!prof){// user doesn't have a profile yet so let's make them one with empty info
          prof={
            name : $('[name="name"]').val(),
            email : $('[name="email"]').val(),
            zip : $('[name="zip"]').val(),
            companies: [],
            schools: [],
            understandsBonfires:false,
          }
        }
        prof.profile_pic_id=fileObj._id
        Meteor.call("setProfile",Meteor.userId(),prof)
        console.log(Meteor.user().profile)

        //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
      });
    }

      // IMGUR API V. 3
      // if (!file || !file.type.match(/image.*/)) return;
      
      // // if it's an image, proceed

      // $.ajax({
      //   url: 'https://api.imgur.com/3/image',
      //   method: 'POST',
      //   headers: {
      //     Authorization: 'Client-ID '+ "b9644f77763b4c9",
      //     Accept: 'application/json'
      //   },
      //   data: {
      //     image: file,
      //     type: 'base64'
      //   },
      //   success: function(result) {
      //     // add in image preview in box
      // }
      // });


      // IMGUR API V. 2
      // var fd = new FormData(); 
      // fd.append("image", file);

      // // my imgur account
      // fd.append("key", "cee09327eace9f79ce95210f2ca8287a38963b0a");
      // var xhr = new XMLHttpRequest();
      // console.log(fd)
      // xhr.open("https://api.imgur.com/3/gallery.json?callback=POST");
      // xhr.onload = function() {

      //   // GET THE LINK
      //       var link = JSON.parse(xhr.responseText).upload.links.imgur_page;
      // }
      // xhr.send(fd);
    },

    'dragover window': function(e) {
      e.preventDefault()
      return false
    },
    'drop window': function(e) {
      e.preventDefault()
      return false
    },

    'drop #holderProfile': function(e) {
      e.preventDefault(); 
      //upload(e.dataTransfer.files[0]); 
      console.log(e);
    },
    



  });

  Template.userMap.rendered=function(){
    geocoder = new google.maps.Geocoder();
    var lat = '';
    var lng = '';
    var address = this.data
    console.log(address)
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
         lat = results[0].geometry.location.lat();
         lng = results[0].geometry.location.lng();
        console.log('Latitude: ' + lat + ' Logitude: ' + lng);
        var mylocation = new google.maps.LatLng(lat, lng)
        var marker = new google.maps.Marker({
          position: mylocation,
          icon:'http://i.imgur.com/a9EUtE6.png'
        });
        var mapOptions = {
          center: mylocation,
          zoom: 6,
          scrollwheel:false,
        };
        var map = new google.maps.Map(document.getElementById("user_map_canvas"),
            mapOptions);
        marker.setMap(map); 
      } else {
        console.log("Geocode was not successful for the following reason: " + status);
      }
    });
    


  }

}





/********************************
      Server Code
*********************************/
schools = new Meteor.Collection("schools");
if (Meteor.isServer) {

  Meteor.startup(function () {
    // code ran on server startup
    // nothing here yet!
    // if(schools.find().count() === 0){
    //   for (i in uscolleges){
    //     schools.insert(i);
    //   }
    // }
}),

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
      if(membership){ // user is already a member
        Memberships.remove(membership)

        return false;
      }else{
        Memberships.insert({
          user_id: userId,
          bonfire_id: bonfireId
        })
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
    },

    userUnderstandsBonfires: function(userId){
      var profile=Meteor.users.findOne({_id:userId}).profile
      if(!profile){// user doesn't have a profile yet so let's make them one with empty info
        var profile={
          name : $('[name="name"]').val(),
          email : $('[name="email"]').val(),
          zip : $('[name="zip"]').val(),
          companies: [],
          schools: [],
          understandsBonfires:false,
        }
      }
      profile.understandsBonfires=true
      Meteor.call("setProfile", userId, profile)
      
    },

    populateSchools: function(){
      return JSON.parse(Assets.getText('uscolleges.json'));
    }


  });



} // end isServer
