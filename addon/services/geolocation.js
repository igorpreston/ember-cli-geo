import { assert } from '@ember/debug';
import { Promise as EmberPromise } from 'rsvp';
import { computed } from '@ember/object';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default Service.extend(Evented, {

  geolocator: computed(() => {
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
    return new EmberPromise((resolve, reject) => {
      this.get('geolocator').getCurrentPosition((geoObject) => {
        this._handleNewPosition(geoObject);
        resolve(geoObject);
      }, (reason) => {
        this.trigger('geolocationFail', reason);
        reject(reason);
      }, geoOptions);
    });
  },

  trackLocation(geoOptions, callback) {
    let watcherId = this.get('watcherId');

    assert(watcherId == null, 'Warning: `trackLocation` was called but a tracker is already set');

    if (callback != null) {
      assert(typeof callback === 'function', "callback should be a function");
    }
    this.set('trackingCallback', callback);

    return new EmberPromise((resolve, reject) => {
      watcherId = this.get('geolocator').watchPosition((geoObject) => {
        // make sure this logic is run only once
        if (resolve) {
          this.set('watcherId', watcherId);
          resolve(geoObject);
          resolve = null;
        }
        this._handleNewPosition(geoObject);
      }, (reason) => {
        this.trigger('geolocationFail', reason);
        reject(reason);
      }, geoOptions);
    });
  },

  stopTracking(clearLocation) {
    let watcher = this.get('watcherId');
    assert(watcher != null, 'Warning: `stopTracking` was called but location isn\'t tracked');
    this.get('geolocator').clearWatch(watcher);
    this.set('watcherId', null);
    if (clearLocation === true) {
        this.set('currentLocation', null);
    }
  },

});
