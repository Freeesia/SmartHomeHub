<template>
  <v-app>
    <v-navigation-drawer :mini-variant="!drawer" permanent clipped fixed app>
      <v-list dense>
        <v-list-item v-for="item in menus" :key="item.key" :to="item.key">
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar dense fixed clipped-left app dark color="primary">
      <v-app-bar-nav-icon
        role="switch"
        aria-label="menu"
        :aria-checked="drawer"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Smart Home Hub</v-toolbar-title>
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app></v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class App extends Vue {
  drawer = true;
  menus = [
    { key: '/', label: 'Home', icon: 'home' },
    { key: 'pc', label: 'PC', icon: 'computer' },
    { key: 'ps4', label: 'PS4', icon: 'mdi-playstation' },
    { key: 'remo', label: 'Nature Remo', icon: 'settings_remote' },
  ]

  created() {
    this.drawer = this.$vuetify.breakpoint.mdAndUp;
  }
}
</script>
