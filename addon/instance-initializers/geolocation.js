import Ember from 'ember';

export function initialize(instance) {
  Ember.Geolocation = Ember.Namespace.create();
}

export default {
  name: 'geolocation',
  initialize: initialize
};
