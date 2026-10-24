import { defineStore } from "pinia";
import { ref } from "vue";

export const useCountStore = defineStore(
  "count",
  () => {
    const count = ref(0);

    function inc() {
      count.value++;
    }

    async function incAsync() {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      inc();
    }

    return { count, inc, incAsync };
  },
  { persist: { pick: ["count"] } },
);
