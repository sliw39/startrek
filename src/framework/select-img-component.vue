<template>
  <div class="select-img">
    <div
      class="select-img-option"
      v-for="opt in options"
      :key="opt.key"
      :title="opt.key"
      :style="getUrl(opt.url)"
      :class="{ selected: opt.key === value }"
      @click="setValue(opt.key)"
    ></div>
  </div>
</template> 

<style lang="less">
.select-img {
  display: flex;
  flex-flow: row wrap;

  > .select-img-option {
    height: 50px;
    width: 50px;
    border: 3px solid rgb(245, 235, 103);
    background-size: cover;
    cursor: pointer;

    &.selected {
      border: 3px solid rgb(255, 72, 72);
    }
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit } from "vue-property-decorator";

@Component
export default class SelectImgComponent extends Vue {
  @Prop(String) value!: string;
  @Prop({ type: Array, default: [] }) options!: { key: string; url: string }[];

  getUrl(url: any) {
    return { backgroundImage: `url(${url})` };
  }

  @Emit("input")
  setValue(key: string) {
    return key;
  }
}

Vue.component("select-img-component", SelectImgComponent);
</script>