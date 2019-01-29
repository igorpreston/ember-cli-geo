import sinon from 'sinon';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';

describe('GeolocationService', function() {
  setupTest('service:geolocation');

  it('exists', function() {
    let service = this.subject();
    expect(service).to.be.ok;
  });

  describe('checks if it', function() {
    it('responds to `geolocation`', function() {
      let service = this.subject();
      expect(service).itself.to.respondTo('getLocation');
    });

    it('responds to `trackLocation`', function() {
      let service = this.subject();
      expect(service).itself.to.respondTo('trackLocation');
    });

    it('has property `currentLocation`', function() {
      let service = this.subject();
      expect(service).to.have.property('currentLocation');
    });

    it('responds to `stopTracking`', function() {
      let service = this.subject();
      expect(service).to.have.property('stopTracking');
    });

  });

  describe('determines geolocation and', function() {
    const geoObject = {
      coords: {
        accuracy: 100,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: NaN,
        latitude: 37.789,
        longitude: -122.412,
        speed: NaN
      },
      timestamp: 1435861233751
    };
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      sandbox.stub(window.navigator.geolocation, 'getCurrentPosition', (fn) =>{
        fn.call(null, geoObject);
      });
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('gets user geolocation from window.navigator', function(done) {
      const service = this.subject();

      service.getLocation().then(function(result) {
        expect(result).to.equal(geoObject);
        done();
      });
    });

    it('sets user\'s current location in the `currentLocation` property', function(done) {
      const service = this.subject();

      expect(service).to.have.property('currentLocation').that.is.null;
      service.getLocation().then(function() {
        expect(service).to.have.property('currentLocation').that.is.an('array').and.not.null;
        done();
      });
    });

    it('#startTracking receives a callback function that\'s called whenever a new position is tracked', function() {
      const service = this.subject();

      sandbox.stub(window.navigator.geolocation, 'watchPosition', (fn) =>{
        fn.call(null, geoObject);
        fn.call(null, geoObject);
        fn.call(null, geoObject);
      });

      let spy = sinon.spy();

      service.trackLocation(null, spy);

      expect(spy.callCount).to.equal(3, 'callback is not called when new position is available');
    });

    it('#stopTracking removes tracker from browser loop', function() {
      const service = this.subject();
      let spy = sandbox.spy(window.navigator.geolocation, 'clearWatch');

      service.stopTracking();

      expect(spy.calledOnce).to.equal(true, '#clearWatch should be called on browser geolocation');
    });

    it('#stopTracking can clear currentLocation', function() {
      const service = this.subject();
      let spy = sandbox.spy(window.navigator.geolocation, 'clearWatch');

      service.stopTracking(true);

      expect(spy.calledOnce).to.equal(true, '#clearWatch should be called on browser geolocation');
      expect(service.get('currentLocation')).to.equal(null, 'currentLocation should be cleared');
    });

    it('fails if the browser cannot provide location', function(done) {
      const service = this.subject();
      let successCbCalled = false;

      sandbox.restore();
      sandbox.stub(window.navigator.geolocation, 'getCurrentPosition', (success, fail) =>{
        // PositionError is a number `short` representing the error
        fail.call(null, 1);
      });

      service.getLocation().then(() => {
          successCbCalled = true;
        }, (result) => {
          expect(service).to.have.property('currentLocation').that.is.null;
          expect(result).to.equal(1, 'the error callback didn\'t receive the correct param');
          expect(successCbCalled).to.not.equal(true, 'succcess callback shouldn\'t have been called');
          done();
      });
    });

    it('emits an event `geolocationSuccess` with the position when it\'s fetched', function(done) {
      const service = this.subject();

      service.on('geolocationSuccess', (result) => {
        expect(result).to.equal(geoObject, 'results should be sent to the listener');
        done();
      });

      service.getLocation();
    });

    it('emits an event `geolocationFail` with the error when it fails', function(done) {
      const service = this.subject();

      sandbox.restore();
      sandbox.stub(window.navigator.geolocation, 'getCurrentPosition', (success, fail) =>{
        // PositionError is a number `short` representing the error
        fail.call(null, 1);
      });

      service.on('geolocationFail', (result) => {
        expect(result).to.equal(1, 'results should be sent to the listener');
        service.off('geolocationFail');
        done();
      });

      service.getLocation();
    });

  });
});
