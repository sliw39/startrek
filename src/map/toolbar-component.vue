<template>
<div class="toolbar">
    <button @click="zoomIn">+</button>
    <button @click="zoomOut">-</button>
</div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Emit} from "vue-property-decorator";
import { System } from "./objects.model";

@Component
export default class StarComponent extends Vue {
  @Prop(Number) value!: number;

  @Emit('input')
  zoomIn() {
    return this.value + 0.25;
  }

  @Emit('input')
  zoomOut() {
      if(this.value > 0.25) {
          return this.value - 0.25;
      } else {
          return this.value;
      }
  }
}
</script>

<style lang="less">
.toolbar {
    width: 50px;
    height: 25px;
    display: flex;
    flex-flow: row nowrap;

    > button {
        width: 25px;
        height: 25px;
        color: black
    }
}
</style>