import Ember from 'ember';

export default Ember.Route.extend({
  geolocation: Ember.inject.service(),

  actions: {
    getUserLocation(geoOptions) {
      this.get('geolocation').getLocation().then((geoObject) => {
        let currentLocation = this.get('geolocation').get('currentLocation');
        this.controllerFor('geolocator').set('userLocation', currentLocation);
      }, (reason) => {
        console.log('Geolocation failed because ' + reason);
      });
    },

    trackUserLocation(geoOptions) {
      this.get('geolocation').trackLocation().then((geoObject) => {
        let currentLocation = this.get('geolocation').get('currentLocation');
        this.controllerFor('geolocator').set('userLocation', currentLocation);
      }, (reason) => {
        console.log('Geolocation failed because ' + reason);
      });
    }
  }

});
