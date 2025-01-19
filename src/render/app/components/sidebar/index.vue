<template>
  <div class="silder">
    <div class="silder__top">
      <div class="avatar">
        
      </div>
      <div 
        class="aside__item app__no_drag" 
        v-for="item in outsideList" 
        :key="item.id" 
        @click="handleClick(item.router)"
      >
        <div class="aside__content">
            <img class="icon__img" :src="item.activeIcon" v-if="item.router === route.path" />
            <img  class="icon__img" :src="item.defaultIcon" v-else />
            <div>{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>




<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useRouter, useRoute } from 'vue-router';

import {outsideList} from './data'
export default defineComponent({
  components: {
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const handleClick = (path: string) => {
      router.push({ path:  path });
      console.log('!!!!!!!!!!!', route)
    };

    return {
      route,
      handleClick,
      outsideList
    };
  },
});
</script>

<style lang="less" scoped>
.silder {
  width: 66px;
  background: #39445d;
  .silder__top{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .aside__item {
      margin-bottom: 20px;
      .aside__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        .icon__img {
          width: 24px;
        }
      } 
    } 
  }
}
</style>
