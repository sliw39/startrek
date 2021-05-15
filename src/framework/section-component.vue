<template>
  <div
    class="section-container"
    :class="containerClasses"
    :style="containerStyles"
  >
    <h1 class="section-title">{{ title }}</h1>
    <div class="section-content">
      <slot></slot>
    </div>
  </div>
</template>
 
<style lang="less">
.section-container {
  position: relative;
  height: 100%;
  width: 100%;
  margin: 2px;
  border-width: 0;
  font-size: 0.85em;

  h1 {
    color: black;
    font-size: 1.3em;
    font-weight: normal;
  }
  .section-title {
    padding-left: 5px;
  }

  .section-content {
    background-color: black;
    height: 100%;
    padding: 5px;
  }

  &.top-title {
    display: flex;
    flex-direction: column;

    .section-title {
      width: 100%;
    }
  }

  &.left-title {
    display: flex;
    flex-direction: row;

    .section-title {
      width: 50px;
      height: 100%;
    }
  }

  &.right-title {
    display: flex;
    flex-direction: row-reverse;

    .section-title {
      width: 50px;
      height: 100%;
    }
  }

  &.bottom-title {
    display: flex;
    flex-direction: column-reverse;

    .section-title {
      width: 100%;
    }
  }
}
</style>

<script lang="ts">
import { parseBorder, parseCorner } from "./style.utils";
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class SectionComponent extends Vue {
  @Prop(String) title!: string;
  @Prop(String) color!: string;
  @Prop({ type: Number, default: 9 }) corners!: number;
  @Prop({ type: Number, default: 8 }) titlePos!: number;
  @Prop({ type: Number, default: 6 }) borders!: number;

  get containerStyles() {
    return parseBorder(this.borders);
  }

  get containerClasses() {
    let classes: { [k: string]: boolean } = {
      ...parseCorner(this.corners),
      "top-title": this.titlePos === 8,
      "left-title": this.titlePos === 4,
      "right-title": this.titlePos === 6,
      "bottom-title": this.titlePos === 2,
    };
    classes[this.color + "-border"] = true;
    classes[this.color] = true;

    return classes;
  }
}

Vue.component("section-component", SectionComponent);
</script>