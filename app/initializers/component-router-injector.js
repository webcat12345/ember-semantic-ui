export default  {
  name: 'component-router-injector',

  initialize(container, application) {
    // Injects all Ember components with a router object:
    application.inject('component', 'router', 'router:main');
  }
};
