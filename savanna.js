


VegList = new Mongo.Collection('Veg');
points_5k = new Mongo.Collection('p5k');
ClassPoints = new Mongo.Collection("Class5k");

if (Meteor.isClient) {
  // counter starts at 0
  Meteor.subscribe("Veg")
  Session.setDefault('id',0);
  Session.setDefault('lat', 0);
  Session.setDefault('lon', 40);

  Template.sideButtons.helpers({
    'vegTypes':function(){
      return VegList.find();
    }
  });

  Template.sideButtons.events({
    'click .button':function(e){

      console.log("You clicked" + this.name);
      console.log("logging");
      Meteor.call("insertClass",Session.get("id"),Session.get("lat"),Session.get("lon"),this.code);
      console.log("animating");
     // $(this).fadeOut( 400 ).delay(200).fadeIn(400);
     //var self=this;
     $(e.currentTarget).animate({ backgroundColor: "#FFFF00" },1).delay(300).animate({ backgroundColor: "#EFEAEA" }, 300);
     //.delay(100).fadeIn(100);
     console.log("removing layer");
      map.removeLayer(map.circ);
     console.log("calling meteor");
      Meteor.call("getLoc",function(error,get_coords){
        if(error){
          console.log("Error occuring:",error)
        }else{
          console.log(get_coords.id)
        Session.set('id',get_coords.id);
        Session.set('lat', get_coords.lat);
        Session.set('lon', get_coords.lon);
        console.log(Session.get('id'))
        var newLat=Session.get('lat');
        var newLng=Session.get('lon');
        console.log("moving map")
        map.setView(L.latLng(newLat,newLng),16);
        map.circ = new L.circle(L.latLng(newLat,newLng), 200,{
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.0
        }).addTo(map);
      }
      });


    }
  });




//Template.satmap.helpers({
//	'coords':function(){
//		return (Session.get('lat') + " " + Session.get('lon'));
//	}});

  Template.satmap.rendered = function () {
  console.log("getting initial points");

      Meteor.call("getLoc",function(error,get_coords){
        if(error){
          console.log("Error occuring:",error);
        }else{
        Session.set('id',get_coords.id);
        Session.set('lat', get_coords.lat);
        Session.set('lon', get_coords.lon);
      }});


    console.log("creating map");
     map = L.map('map',{zoomControl:false, zoom:16}).setView([0,0],16);
  // map = L.map('map',{zoomControl:false, zoom:16}).setView([Session.get('lat'), Session.get('lon')],16);
console.log("defining tile layer");
   L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

    var MapIcon = L.Icon.extend({
        options: {
            shadowUrl: 'img/map/shadow.png'
        }
    });
    L.Icon.Default.imagePath = 'packages/leaflet/images'
    console.log(Session.get('id'))
    var newLat=Session.get('lat');
    var newLng=Session.get('lon');
    console.log("moving map")
    map.setView(L.latLng(newLat,newLng),16);
    map.circ = new L.circle(L.latLng(newLat,newLng), 200,{
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.0
    }).addTo(map);
};
};

//    updateSession=function(e){
//		Session.set('lat',map.getCenter().lat);
//		Session.set('lon',map.getCenter().lng);
//	};

//    map.on('dragend', updateSession);

//    map.circ = new L.circle(L.latLng([Session.get('lat'), Session.get('lon')]), 200,{
//    color: 'red',
//    fillColor: '#f03',
//    fillOpacity: 0.0
//    }).addTo(map);







if (Meteor.isServer) {

  Meteor.publish("Veg",function(){
    return VegList.find();
  });


  if(points_5k.find().count()===0){
  console.log("defining csv")
    pointcsv = Assets.getText('base_points_5k.csv');
    var parseddata2;
    Papa.parse(pointcsv,{
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        parseddata2 = results;
      }});

     //points_5k.remove({});

    var pd = parseddata2.data
    console.log(pd.length)

        for(var i=0;i<pd.length;i++){
          var tpd=pd[i];
          points_5k.insert({"id" : tpd.Id, "lon" : tpd.lon, "lat" : tpd.lat });
        }
  }

  Meteor.startup(function () {

    // Load in vegetation categories - always do this
    vegdata = Assets.getText('veg.csv');
    var parseddata;

    Papa.parse(vegdata,{
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        parseddata = results;
      }});
    var pd = parseddata.data;

    VegList.remove({});

    for(var i=0;i<pd.length;i++){
      var tpd=pd[i];
      VegList.insert({"desc" : tpd.desc, "name" : tpd.name, "thumb" : tpd.thumb,"code" : tpd.code });
    }

    // load in 5k grid points, if they don't exist yet


    configureFacebook = function(config) {
        // first, remove configuration entry in case service is already configured
        ServiceConfiguration.configurations.remove({
            service: "facebook"
        });

       ServiceConfiguration.configurations.insert({
            service: "facebook",
            appId: config.clientId,
            secret: config.secret
        });
    };

    // set the settings object with meteor --settings private/settings-local.json
    var facebookConfig = Meteor.settings.facebook;
    if(facebookConfig) {
        console.log('Got settings for facebook', facebookConfig)
        configureFacebook(facebookConfig);
    }

  });
console.log("Loading array");
var Parray = points_5k.find().fetch();
console.log("array loaded");

  Meteor.methods({
    getLoc: function(){
      console.log("returning points");
      var randomIndex = Math.floor( Math.random() * Parray.length );
      var element = Parray[randomIndex];
      console.log("here's the point");
      return(element)
    },
    insertClass: function(id,lat,lon,code){
      console.log("classifying point");
      console.log(code);
      ClassPoints.insert({
        id:id,
        lat:lat,
        lon:lon,
        code:code,
        at: new Date(),
        user: Meteor.userId()
      })
    }
  });
};
