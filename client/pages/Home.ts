import Vue from 'vue';
import Component from 'vue-class-component';
import TestComponent from '../components/TestComponent';

@Component({ template: require('./Home.html'), components: { TestComponent } })
export default class Home extends Vue {
}