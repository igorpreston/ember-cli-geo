/* jshint expr:true */
import Ember from 'ember';
import { expect } from 'chai';
import { describe, afterEach } from 'mocha';
import {
  describeModule,
  it
} from 'ember-mocha';

describeModule(
  'service:geolocation',
  'GeolocationService',
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  },
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      let service = this.subject();
      expect(service).to.be.ok;
    });

    describe('checks if it', function() {

      it('can get user geolocation', function() {
        let service = this.subject();
        expect(service).itself.to.respondTo('getLocation');
      });

      it('can track user geolocation', function() {
        let service = this.subject();
        expect(service).itself.to.respondTo('trackLocation');
      });

      it('has current location', function() {
        let service = this.subject();
        expect(service).to.have.property('currentLocation');
      });

    });

    describe('determines geolocation and', function() {

      let geoObject = {
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

      afterEach('set current location to null', function() {
        let service = this.subject();
        service.set('currentLocation', null);
      });

      it('gets user geolocation', function() {
        function getLocation() {
          return new Ember.RSVP.Promise(function(resolve, reject) {
            resolve(geoObject);
          });
        }

        getLocation().then(function(geoObject) {
          expect(geoObject).to.be.an('object').and.to.have.all.keys(['coords', 'timestamp']);
          expect(geoObject).to.have.deep.property('coords.latitude', 37.789).that.is.a('number');
          expect(geoObject).to.have.deep.property('coords.longitude', -122.412).that.is.a('number');
        });
      });

      it('sets user\'s current location', function() {
        let service = this.subject();

        function getLocation() {
          return new Ember.RSVP.Promise(function(resolve, reject) {
            service.trigger('geolocationSuccess', geoObject, resolve);
          });
        }

        getLocation().then(function() {
          expect(service).to.have.property('currentLocation').that.is.an('array').and.not.null;
        });
      });

      it('throws an error if user denied to share her location', function() {
        let service = this.subject();

        function getLocation() {
          return new Ember.RSVP.Promise(function(resolve, reject) {
            let reason = "access rejected by user";
            service.trigger('geolocationFail', reason, reject);
          });
        }

        getLocation().then(function() {
          throw new Error('User denied sharing her geolocation!');
        }, function() {
          expect(service).to.have.property('currentLocation').that.is.null;
        });
      });

    });



  }
);
