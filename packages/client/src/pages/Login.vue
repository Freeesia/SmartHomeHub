<template>
  <v-form v-model="valid" ref="form" lazy-validation>
    <v-text-field
      label="Name"
      v-model="name"
      :rules="nameRules"
      prepend-icon="person"
      type="text"
      required
    ></v-text-field>
    <v-text-field
      label="Password"
      v-model="password"
      :rules="passwordRules"
      prepend-icon="lock"
      type="password"
      required
    ></v-text-field>

    <v-btn @click="submit" class="ma-1" color="primary" :loading="submitting" :disabled="!valid">submit</v-btn>
    <v-btn @click="clear" class="ma-1">clear</v-btn>
  </v-form>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Axios from "axios";
import { UserModule } from "@/store/modules/UserState";

@Component({})
export default class Login extends Vue {
  public valid = true;
  public name = "";
  public nameRules = [(v?: string) => !!v || "Name is required"];
  public password = "";
  public passwordRules = [(v?: string) => !!v || "Password is required"];
  public submitting = false;
  public async submit() {
    const form = <HTMLFormElement>this.$refs.form;
    if (!form.validate()) {
      return;
    }
    this.submitting = true;
    try {
      const res = await Axios.post<string>("/api/user/login", {
        username: this.name,
        password: this.password
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
    this.submitting = false;
  }
  public clear() {
    (this.$refs.form as HTMLFormElement).reset();
  }
}
</script>