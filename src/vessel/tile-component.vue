<template>
  <div class="hexagon" :class="part.type" :draggable="draggable" @dragstart="startDrag" @click="part.damage(1)">
    <div class="content">
      <div class="name">{{part.name}}</div>
      <div class="value">{{part.value}}</div>
    </div>
    <transition name="modifier" v-on:after-enter="endModifier">
      <div v-if="modifier !== null" class="modifier" :class="modifier > 0 ? 'modifier-positive' : 'modifier-negative'">{{modifier}}</div>
    </transition>
  </div>
</template>

<style lang="less">
.hexagon {
  height: 12em;
  width: 6.9em;
  background-color: white;
  margin: auto;
  position: relative;
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  user-select: none;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;

  .modifier-enter-active {
    transform: translateY(-10px);
    opacity: 1 !important;
  }
  .modifier{
    transition: all .5s ease;
    font-size: 5em;
    font-weight: bold;
    position: absolute;
    z-index: 500;
    opacity: 0;

    &.modifier-positive {
      color: green;  
    }
    &.modifier-negative {
      color: red;
    }
  }

  &.energy {
      background-color: rgb(137, 198, 255);
  }
  &.defense {
      background-color: rgb(255, 137, 137);
  }
  &.life, &.science {
      background-color: rgb(163, 255, 163);
  }
  &.command {
      background-color: rgb(255, 154, 242);
  }
  &.engineering {
      background-color: rgb(253, 225, 146);
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
    display: flex;
    flex-flow: column;
    justify-content: center;

    > .name { color: black; }
    > .value { color: blue; font-weight: bold; }
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
    border-top: 1px solid white;
    border-bottom: 1px solid white;
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
import { Component, Prop, PropSync, Vue } from "vue-property-decorator";
import { Part } from "./vessel";

@Component
export default class TileComponent extends Vue {
    @PropSync("value") part!: Part;
    @Prop({default: false}) draggable!: boolean;

    private modifier: number|null = null;
    private modifierStack: number[] = [];

    mounted() {
      this.part.onDamage((n, o) => this.addModifier(n-o));
      this.part.onRepair((n, o) => this.addModifier(n-o));
    }

    startDrag(evt: DragEvent) {
      if(this.draggable) {
        console.log("tile drag");
        this.$emit("ondrag", this.part);
      } else {
        evt.preventDefault();
      }
    }

    addModifier(modifier: number) {
      this.modifierStack.push(modifier);
      if(this.modifier === null) {
        this.modifier = this.modifierStack.shift() ?? null;
        this.$forceUpdate();
      }
    }

    endModifier() {
      this.modifier = null;
      if(this.modifierStack.length) {
        setTimeout(() => {
          this.modifier = this.modifierStack.shift() ?? null;
          this.$forceUpdate();
        },400);
      }
    }
}
</script>