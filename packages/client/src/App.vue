<template>
  <v-app>
    <v-navigation-drawer v-if="user" :mini-variant="!drawer" permanent clipped fixed app>
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
        v-if="user"
        :aria-checked="drawer"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Smart Home Hub</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-toolbar-items>
            <v-btn text v-on="on" v-if="user">{{ user.sn }}</v-btn>
          </v-toolbar-items>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
import Vue from "vue";
import Component from "vue-class-component";
import Axios from "axios";
import { UserModule } from "@/store";

@Component({})
export default class App extends Vue {
  drawer = true;
  menus = [
    { key: "/", label: "Home", icon: "home" },
    { key: "pc", label: "PC", icon: "computer" },
    { key: "ps4", label: "PS4", icon: "mdi-playstation" },
    { key: "remo", label: "Nature Remo", icon: "settings_remote" }
  ];

  public get user(): any {
    return UserModule.user;
  }

  public async logout() {
    await UserModule.logout();
    this.$router.push("/login");
  }

  async created() {
    this.drawer = this.$vuetify.breakpoint.mdAndUp;
    await UserModule.loginToken();
    if (!this.user && this.$router.currentRoute.path !== "/login") {
      this.$router.push("/login");
    }
  }
}
</script>
