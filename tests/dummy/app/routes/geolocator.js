import Ember from 'ember';

export default Ember.Route.extend({
  geolocation: Ember.inject.service(),

  actions: {
    getUserLocation: function(geoOptions) {
      var self = this;

      this.get('geolocation').getLocation().then(function(geoObject) {
        let currentLocation = self.get('geolocation').get('currentLocation');
        self.controllerFor('geolocator').set('userLocation', currentLocation);
      }, function(reason) {
        console.log('Geolocation failed because ' + reason);
      }, geoOptions);
    },

    trackUserLocation: function(geoOptions) {
      var self = this;

      this.get('geolocation').trackLocation().then(function(geoObject) {
        let currentLocation = self.get('geolocation').get('currentLocation');
        self.controllerFor('geolocator').set('userLocation', currentLocation);
      }, function(reason) {
        console.log('Geolocation failed because ' + reason);
      }, geoOptions);
    }
  }

});
