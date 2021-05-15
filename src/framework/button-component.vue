<template>
  <div class="btn item" :class="style" @click.stop="onClick">
    <slot></slot>
  </div>
</template>

<style lang="less">
.btn {
  cursor: pointer;
}
</style>
 
<script lang="ts">
import { parseCorner } from "./style.utils";
import { Component, Vue, Prop, Emit } from "vue-property-decorator";

@Component
export default class ButtonComponent extends Vue {
  @Prop(String) color!: string;
  @Prop({ type: Number, default: 5 }) corners!: number;

  get style() {
    let classes: { [k: string]: boolean } = parseCorner(this.corners);
    classes[this.color || "yellow"] = true;
    return classes;
  }

  @Emit("click")
  onClick() {}
}

Vue.component("button-component", ButtonComponent);
</script>