import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  currentLocation: null,

  getLocation: function(geoOptions) {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {

      navigator.geolocation.getCurrentPosition(function(geoObject) {
        self.trigger('geolocationSuccess', geoObject, resolve);
      }, function(reason) {
        self.trigger('geolocationFail', reason, reject);
      }, geoOptions);
    });
  },

  trackLocation: function(geoOptions) {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {

      navigator.geolocation.watchPosition(function(geoObject) {
        self.trigger('geolocationSuccess', geoObject, resolve);
      }, function(reason) {
        self.trigger('geolocationFail', reason, reject);
      }, geoOptions);
    });
  },

  geolocationDidSucceed: Ember.on('geolocationSuccess', function(geoObject, resolve) {
    this.set('currentLocation', [geoObject.coords.latitude, geoObject.coords.longitude]);
    resolve(geoObject);
  }),

  geolocationDidFail: Ember.on('geolocationFail', function(reason, reject) {
    reject(reason);
  })

});
