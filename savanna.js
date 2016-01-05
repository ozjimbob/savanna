VegList = new Mongo.Collection('Veg');



if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('lat', -42.0);
  Session.setDefault('lon', 145.0);

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
     map = L.map('map').setView([Session.get('lat'), Session.get('lon')], 5);
    
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
    
    map.circ = new L.circle(L.latLng(0,0), 200,{
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.0
    }).addTo(map);
  //  Sites.find().fetch().forEach(function(site) {
  //      var icon = new MapIcon({iconUrl: 'img/map/map-icon-undefined.png'});
  //      var marker = L.marker([site.location.coords[0], site.location.coords[1]], {icon: icon});
  //      marker.bindPopup('<strong>' + site.name + '</strong><br />' + site.location.address);
  //      marker.addTo(map);
  //  });
};

L.Icon.Default.imagePath = 'packages/leaflet/images'

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
