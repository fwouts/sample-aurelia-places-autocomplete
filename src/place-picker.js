import {inject, customElement, bindable} from 'aurelia-framework';
import mapsapi from 'google-maps-api';

@customElement('place-picker')
@inject(Element, mapsapi('YOUR_API_KEY_HERE', ['places']))
export class PlacePicker {

  @bindable location;

  constructor(element, mapsApi) {
    this.element = element;
    this.mapsApi = mapsApi;
    this.maps = null;
  }

  attached() {
    this.mapsApi.then(maps => {
      this.maps = maps;
      var mapContainer = this.element.querySelector('.place-picker-map');
      var map = new this.maps.Map(mapContainer, {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13
      });
      var input = this.element.querySelector('input');
      var autocomplete = new google.maps.places.Autocomplete(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      autocomplete.bindTo('bounds', map);

      var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });

      let updateMarker = () => {
        var position = new google.maps.LatLng(this.location.lat, this.location.lng);
        map.setCenter(position);
        marker.setPosition(position);
        marker.setVisible(true);
      };

      updateMarker();
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
