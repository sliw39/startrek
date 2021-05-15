<template>
  <div
    class="star"
    ref="star"
    @click="$emit('clicked')"
    @dblclick="$emit('dblclicked')"
    :class="classes"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    &nbsp;<span class="name">{{ system.names[0] }}</span
    >&nbsp;<span class="subname" v-if="system.names[1]"
      >({{ system.names[1] }})</span
    >
  </div>
</template>
 
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { System } from "./objects.model";

@Component
export default class StarComponent extends Vue {
  @Prop(System) system!: System;
  @Prop(Number) x!: number;
  @Prop(Number) y!: number;
  @Prop({ type: Boolean, default: false }) selected!: boolean;

  get classes() {
    let classes: any = { selected: this.selected };

    let color: string;
    if (this.system.temperature < 2500) {
      color = "rd";
    } else if (this.system.temperature < 5000) {
      color = "r";
    } else if (this.system.temperature < 6000) {
      color = "y";
    } else if (this.system.temperature < 8000) {
      color = "w";
    } else {
      color = "b";
    }
    classes[`color-${color}-v1`] = true;

    return classes;
  }
}
</script>

<style lang="less">
.star {
  position: absolute;
  cursor: pointer;
  color: white;
  user-select: none;

  &.color-rd-v1::before {
    background-image: url(/static/map/star1-rd.png);
  }
  &.color-rd-v2::before {
    background-image: url(/static/map/star2-rd.png);
  }
  &.color-rd-v3::before {
    background-image: url(/static/map/star3-rd.png);
  }
  &.color-rd-v4::before {
    background-image: url(/static/map/star4-rd.png);
  }

  &.color-r-v1::before {
    background-image: url(/static/map/star1-r.png);
  }
  &.color-r-v2::before {
    background-image: url(/static/map/star2-r.png);
  }
  &.color-r-v3::before {
    background-image: url(/static/map/star3-r.png);
  }
  &.color-r-v4::before {
    background-image: url(/static/map/star4-r.png);
  }

  &.color-y-v1::before {
    background-image: url(/static/map/star1-y.png);
  }
  &.color-y-v2::before {
    background-image: url(/static/map/star2-y.png);
  }
  &.color-y-v3::before {
    background-image: url(/static/map/star3-y.png);
  }
  &.color-y-v4::before {
    background-image: url(/static/map/star4-y.png);
  }

  &.color-w-v1::before {
    background-image: url(/static/map/star1-w.png);
  }
  &.color-w-v2::before {
    background-image: url(/static/map/star2-w.png);
  }
  &.color-w-v3::before {
    background-image: url(/static/map/star3-w.png);
  }
  &.color-w-v4::before {
    background-image: url(/static/map/star4-w.png);
  }

  &.color-b-v1::before {
    background-image: url(/static/map/star1-b.png);
  }
  &.color-b-v2::before {
    background-image: url(/static/map/star2-b.png);
  }
  &.color-b-v3::before {
    background-image: url(/static/map/star3-b.png);
  }
  &.color-b-v4::before {
    background-image: url(/static/map/star4-b.png);
  }

  &::before {
    position: absolute;
    background-image: url(/static/map/star1-w.png);
    content: " ";
    left: -10px;
    top: -10px;
    height: 20px;
    width: 20px;
  }

  &.selected {
    color: yellow;
  }

  > .name {
  }

  > .subname {
    font-size: 10px;
  }
}
</style>