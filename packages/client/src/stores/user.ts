import { defineStore } from "pinia";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { computed, ref } from "vue";

export interface User {
  uid: string;
  sn?: string;
  [key: string]: unknown;
}

export const useUserStore = defineStore(
  "user",
  () => {
    const token = ref<string | null>(null);

    const user = computed<User | null>(() =>
      token.value ? jwtDecode<User>(token.value) : null,
    );

    async function login(payload: { username: string; password: string }) {
      const res = await axios.post<string>("/api/user/login", payload);
      token.value = res.data;
    }

    async function loginToken() {
      if (!token.value) {
        return;
      }
      try {
        const res = await axios.post<string>("/api/user/login", null, {
          headers: { Authorization: "Bearer " + token.value },
        });
        token.value = res.data;
      } catch {
        token.value = null;
      }
    }

    async function logout() {
      await axios.post("/api/user/logout");
      token.value = null;
    }

    return { token, user, login, loginToken, logout };
  },
  { persist: { pick: ["token"] } },
);
