import Vue from "vue";
import Component from "vue-class-component";
import Axios from 'axios';

@Component({ template: require('./PC.html') })
export default class PC extends Vue {
  headers = [
    { text: 'PC名', value: 'name' },
    { text: '操作', value: 'action', sortable: false },
  ]
  items: string[] = [];
  snackbar = false;
  snackText = '';
  snackColor = '';

  created() {
    this.initialize();
  }

  async initialize() {
    const res = await Axios.get('/api/pc');
    this.items = res.data;
  }

  async powerOn(item) {
    try {
      await Axios.post(`/api/pc/${item}/on`);
      this.snackColor = 'success';
      this.snackText = 'OK';
    } catch (error) {
      this.snackColor = 'error';
      this.snackText = error;
    }
    this.snackbar = true;
  }
}