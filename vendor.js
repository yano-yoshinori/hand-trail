var global = {
    $: require('jquery'),
    React: require('react'),
    ReactDOM: require('react-dom'),
    _: require('lodash'),
    Backbone: require('backbone'),
    localforage: require('localforage')
};
global.jQuery = global.$;

_.assign(window, global);
