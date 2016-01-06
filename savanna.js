


VegList = new Mongo.Collection('Veg');

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('lat', -13.8295);
  Session.setDefault('lon', 130.23924);

Template.sideButtons.helpers({
  'vegTypes':function(){
    return VegList.find();
  }
});

Template.sideButtons.events({
  'click .button':function(e){

    console.log("You clicked" + this.name)
   // $(this).fadeOut( 400 ).delay(200).fadeIn(400);
   //var self=this;
   $(e.currentTarget).animate({ backgroundColor: "#FFFF00" },1).delay(300).animate({ backgroundColor: "#EFEAEA" }, 300);
   //.delay(100).fadeIn(100);
    map.removeLayer(map.circ);
    var newLat=(Math.random()*40)-20
    var newLng=(Math.random()*360)-180
    map.setView(L.latLng(newLat,newLng),16)
    map.circ = new L.circle(L.latLng(newLat,newLng), 200,{
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.0
    }).addTo(map);
  }
});

Template.satmap.helpers({
	'coords':function(){
		return (Session.get('lat') + " " + Session.get('lon'));
	}});

  Template.satmap.rendered = function () {
     map = L.map('map',{zoomControl:false, zoom:16}).setView([Session.get('lat'), Session.get('lon')],16);

   L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

    var MapIcon = L.Icon.extend({
        options: {
            shadowUrl: 'img/map/shadow.png'
        }
    });

    updateSession=function(e){
		Session.set('lat',map.getCenter().lat);
		Session.set('lon',map.getCenter().lng);
	};

    map.on('dragend', updateSession);

    map.circ = new L.circle(L.latLng([Session.get('lat'), Session.get('lon')]), 200,{
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.0
    }).addTo(map);

};


L.Icon.Default.imagePath = 'packages/leaflet/images'

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    vegdata = Assets.getText('veg.csv');
    var parseddata;

    Papa.parse(vegdata,{
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        parseddata = results;
      }});
    var pd = parseddata.data

    VegList.remove({});

    for(var i=0;i<pd.length;i++){
      var tpd=pd[i];
      VegList.insert({"desc" : tpd.desc, "name" : tpd.name, "thumb" : tpd.thumb,"code" : tpd.code });

    }

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
}
