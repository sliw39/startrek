<template>
<div 
    class="star" 
    ref="star"
    @click="$emit('clicked')" 
    :class="{'selected': selected}"
    :style="{left: x+'px', top: y+'px'}">&nbsp;<span class="name">{{system.names[0]}}</span>&nbsp;<span class="subname" v-if="system.names[1]">({{system.names[1]}})</span></div>
</template>

<script lang="ts">
import {Component, Vue, Prop} from "vue-property-decorator";
import { System } from "./objects.model";

@Component
export default class StarComponent extends Vue {
  @Prop(System) system!: System;
  @Prop(Number) x!: System;
  @Prop(Number) y!: System;
  @Prop({type: Boolean, default: false}) selected!: boolean;

}
</script>

<style lang="less">
.star {
    position: absolute;
    cursor: pointer;
    color: white;
    user-select: none;

    &::before {
        position: absolute;
        content: "*";
        left: -3px;
        top: -6px;
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