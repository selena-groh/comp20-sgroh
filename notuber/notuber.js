/* notuber.js */

/* round function source: http://www.jacklmoore.com/notes/rounding-in-javascript */
function round(value, decimals) {
  "use strict";
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function placeMarkers(map, icons, self, users) {
  "use strict";
  var infowindow = new google.maps.InfoWindow(),
    i;

  function addMarker(type, user) {
    var position = new google.maps.LatLng(user.lat, user.lng),
      marker = new google.maps.Marker({
        position: position,
        icon: icons[type],
        map: map
      }),
      dist = 0,
      content = "";

    if (type === "self") {
      content = '<div id="infowindow">' + '<h3>' + user.username + '</h3></div>';
      infowindow.setContent(content);
      infowindow.open(map, marker);
    } else {
      dist = google.maps.geometry.spherical.computeDistanceBetween(position, self.position);
      dist = round(dist * 0.000621371, 2);
      
      content = '<div id="infowindow">' +
                '<h3>' + user.username +
                ' ('   + dist + ' mi)</h3></div>';
    }
    
    marker.addListener('click', function () {
      infowindow.setContent(content);
      infowindow.open(map, marker);
    });
  }

  addMarker(self.type, self);
  
  if (users.passengers) {
    for (i = 0; i < users.passengers.length; i += 1) {
      addMarker('passenger', users.passengers[i]);
    }
  }

  if (users.vehicles) {
    for (i = 0; i < users.vehicles.length; i += 1) {
      addMarker('vehicle', users.vehicles[i]);
    }
  }

  map.setCenter(self.position);
  map.setZoom(15);
}

function makeRequest(map, icons, self, placeMarkers) {
  "use strict";
  var request = new XMLHttpRequest(),
    parameters = "";

  request.open("POST", "https://salty-harbor-98104.herokuapp.com/submit", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  request.onreadystatechange = function () {
    var users;
    
    if (request.readyState === 4 && request.status === 200) {
      users = JSON.parse(request.responseText);
      placeMarkers(map, icons, self, users);
    } else if (request.readyState === 4 && request.status !== 200) {
      alert("Error: XML request went wrong.");
    }
  };
  
  parameters = "username=" + self.username +
               "&lat="     + self.position.lat() +
               "&lng="     + self.position.lng();
  request.send(parameters);
}

function initMap() {
  "use strict";
  var usa = new google.maps.LatLng(37.0902, -95.7129),
    map = new google.maps.Map(document.getElementById('map'), {
      center: usa,
      zoom: 4
    }),
    icons = {
      passenger: {
        url: "passenger.png",
        scaledSize: new google.maps.Size(30, 50),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 50)
      },
      vehicle: {
        url: "black_car.png",
        scaledSize: new google.maps.Size(50, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 20)
      },
      self: {
        url: "self.png",
        scaledSize: new google.maps.Size(50, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 20)
      }
    },
    self = {
      username: 'bG3XpClP',
      lat: 0,
      lng: 0,
      position: new google.maps.LatLng(0, 0),
      type: "self"
    };
    

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      self.lat = position.coords.latitude;
      self.lng = position.coords.longitude;
      self.position = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);

      makeRequest(map, icons, self, placeMarkers);
    }, function () {
      alert('Error: Geolocation failed.');
    });
  } else {
    alert('Error: Your browser does not support geolocation.');
  }
}
