export function initialize(registry, application) {
  registry.register("geolocation:main", Geolocation);
  application.inject('route', 'geolocation', 'geolocation:main');
  application.inject('controller', 'geolocation', 'geolocation:main');
  application.inject('component', 'geolocation', 'geolocation:main');
}

export default {
  name: 'geolocation',
  initialize: initialize
};
