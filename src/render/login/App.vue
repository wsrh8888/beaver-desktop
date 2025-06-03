<template>
  <div class="app__content">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";

export default defineComponent({
  setup() {
   

    return {
    };
  },
});
</script>

<style lang="less" scoped>
.login__content {
  height: 100%;
  display: flex;

  .login__left {
    width: 391px;
    height: 100%;
    background: #7c7676;
  }

  .login__right {
    flex: 1;
    padding: 20px;

    .login__right__header {
      height: 172px;
    }

    .login__right__content {
      width: 100%;

      .btn__login {
        width: 100%;
        height: 40px;
      }
    }

    // .login__right__footer {
    //   width: 100%;
    //   height: 100px;
    // }
  }
}
</style>
