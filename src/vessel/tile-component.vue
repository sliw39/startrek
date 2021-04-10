<template>
    <div class="hexagon" :class="part.type">
        <div class="content">
            <div class="name">{{part.name}}</div>
            <div class="value">{{part.value}}</div>
        </div>
    </div>
</template>

<style lang="less">
.hexagon {
  height: 12em;
  width: 6.9em;
  background-color: white;
  margin: auto;
  position: relative;

  &.energy {
      background-color: rgb(137, 198, 255);
  }
  &.defense {
      background-color: rgb(255, 137, 137);
  }
  &.life {
      background-color: rgb(163, 255, 163);
  }
  &.command {
      background-color: rgb(255, 154, 242);
  }
  &.science, &.engineering {
      background-color: rgb(255, 207, 75);
  }

  >.content {
    position: absolute;
    text-align: center;
    z-index: 1;
    top: 20%;
    bottom: 20%;
    left: -20%;
    right: -20%;
    font-size: 2em;

    > .name { color: black; }
    > .value { color: red; }
  }

  &::before,
  &::after {
    position: absolute;
    content: "";
    background: inherit;
    height: 100%;
    width: 100%;
    border-radius: 0;
    transform-origin: center;
  }
  &::before {
    transform: rotateZ(60deg);
  }
  &::after {
    transform: rotateZ(-60deg);
  }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Part } from "./vessel";

@Component
export default class TileComponent extends Vue {
    @Prop() part!: Part;
}
</script>