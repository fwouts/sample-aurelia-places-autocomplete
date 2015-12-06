import {inject, customElement, bindable} from 'aurelia-framework';
import mapsapi from 'google-maps-api';

@customElement('place-picker')
// Get an API key from https://developers.google.com/maps/documentation/javascript/get-api-key.
@inject(Element, mapsapi('YOUR_API_KEY_HERE', ['places']))
export class PlacePicker {

  @bindable location;

  constructor(element, mapsApi) {
    this.element = element;
    this.mapsApi = mapsApi;
  }

  attached() {
    // This loads the Google Maps API asynchronously.
    this.mapsApi.then(maps => {
      // Now that it's loaded, add a map to our HTML.
      var mapContainer = this.element.querySelector('.place-picker-map');
      var map = new maps.Map(mapContainer, {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13
      });

      // Also convert our input field into a place autocomplete field.
      var input = this.element.querySelector('input');
      var autocomplete = new google.maps.places.Autocomplete(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      autocomplete.bindTo('bounds', map);

      // Create a marker that will show where the selected place is.
      var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });

      // Create a lambda that moves the marker and the map viewport.
      let updateMarker = () => {
        var position = new google.maps.LatLng(this.location.lat, this.location.lng);
        map.setCenter(position);
        marker.setPosition(position);
        marker.setVisible(true);
      };

      // Ensure that the current location is shown properly.
      updateMarker();

      // Update the location and its marker every time a new place is selected.
      autocomplete.addListener('place_changed', () => {
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (place.geometry) {
          this.location.name = place.name;
          this.location.lat = place.geometry.location.lat();
          this.location.lng = place.geometry.location.lng();
          updateMarker();
        }
      });
    });
  }
}
