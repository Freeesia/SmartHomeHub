import Vue from "vue";
import Component from "vue-class-component";
import Axios from "axios";

@Component({ template: require('./PS4.html') })
export default class PS4 extends Vue {
  status = null;
  refreshing = false;
  powering = false;

  get state(): string {
    if (this.status['running-app-name']) {
      return this.status['running-app-name'];
    } else if (this.status) {
      return this.status.status;
    } else {
      return 'Unknown';
    }
  }

  get media(): string {
    if (this.status && this.status['running-app-meta'] && this.status['running-app-meta'].icons[0].icon) {
      return this.status['running-app-meta'].icons[0].icon;
    } else {
      return null;
    }
  }

  get powerTo(): string {
    if (this.status) {
      return this.status.statusCode == 200 ? 'off' : 'on'
    } else {
      return null;
    }
  }

  created() {
    this.refresh();
  }

  async refresh() {
    this.refreshing = true;
    let res = await Axios.get('/api/ps4');
    this.status = res.data;
    this.refreshing = false;
  }

  async power() {
    this.powering = true;
    await Axios.post('/api/ps4/' + this.powerTo);
    await this.refresh();
    this.powering = false;
  }
}