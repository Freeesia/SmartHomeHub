import Vue from 'vue';
import Component from 'vue-class-component';

@Component({ template: require('./App.html') })
export default class App extends Vue {
  drawer = true;
  menus = [
    { key: '/', label: 'Home', icon: 'home' },
    { key: 'pc', label: 'PC', icon: 'computer' },
    { key: 'ps4', label: 'PS4', icon: 'mdi-playstation' },
    { key: 'remo', label: 'Nature Remo', icon: 'settings_remote' },
  ]
}