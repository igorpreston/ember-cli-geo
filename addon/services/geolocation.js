import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  geolocator: Ember.computed(() => {
    return window.navigator.geolocation;
  }),

  _handleNewPosition(geoObject) {
    this.set('currentLocation', [geoObject.coords.latitude, geoObject.coords.longitude]);
    const callback = this.get('trackingCallback');
    if (callback) {
      callback(geoObject);
    }
    this.trigger('geolocationSuccess', geoObject);
  },

  currentLocation: null,

  getLocation(geoOptions) {
    let that = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('geolocator').getCurrentPosition((geoObject) => {
        this._handleNewPosition(geoObject);
        Ember.run.next(that, function () {
          resolve(geoObject);
        });
      }, (reason) => {
        this.trigger('geolocationFail', reason);
        Ember.run.next(that, function () {
          reject(reason);
        });
      }, geoOptions);
    });
  },

  trackLocation(geoOptions, callback) {
    let watcherId = this.get('watcherId');

    Ember.assert(watcherId == null, 'Warning: `trackLocation` was called but a tracker is already set');

    if (callback != null) {
      Ember.assert(typeof callback === 'function', "callback should be a function");
    }
    this.set('trackingCallback', callback);
    let that = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      let watcherId = this.get('geolocator').watchPosition((geoObject) => {
        // make sure this logic is run only once
        if (resolve) {
          this.set('watcherId', watcherId);
          Ember.run.next(that, function () {
            resolve(geoObject);
            resolve = null;
          });
        }
        this._handleNewPosition(geoObject);
      }, (reason) => {
        this.trigger('geolocationFail', reason);
        Ember.run.next(that, function () {
          reject(reason);
        });
      }, geoOptions);
    });
  },

  stopTracking(clearLocation) {
    let watcher = this.get('watcherId');
    Ember.assert(watcher != null, 'Warning: `stopTracking` was called but location isn\'t tracked');
    this.get('geolocator').clearWatch(watcher);
    this.set('watcherId', null);
    if (clearLocation === true) {
      this.set('currentLocation', null);
    }
  },

});
