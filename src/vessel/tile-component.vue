<template>
  <div
    class="hexagon"
    :class="classes"
    :draggable="draggable"
    @dragstart="startDrag"
  >
    <div class="content">
      <div class="name">{{ part.name }}</div>
      <div class="value">{{ part.value }}</div>
    </div>
    <transition name="modifier" v-on:after-enter="endModifier">
      <div
        v-if="modifier !== null"
        class="modifier"
        :class="modifier > 0 ? 'modifier-positive' : 'modifier-negative'"
      >
        {{ modifier }}
      </div>
    </transition>
  </div>
</template>

<style lang="less">
:root {
  --gscale: 0;
}
.hexagon {
  height: 12em;
  width: 6.9em;
  background-color: white;
  filter: drop-shadow(2px 4px 4px #222) grayscale(var(--gscale));
  margin: auto;
  position: relative;
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  user-select: none;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;

  .modifier-enter-active {
    transform: translateY(-10px);
    opacity: 1 !important;
  }
  .modifier {
    transition: all 0.5s ease;
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
  &.life,
  &.science {
    background-color: rgb(163, 255, 163);
  }
  &.command {
    background-color: rgb(255, 154, 242);
  }
  &.engineering {
    background-color: rgb(253, 225, 146);
  }

  > .content {
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

    > .name {
      color: black;
    }
    > .value {
      color: blue;
      font-weight: bold;
    }
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

  &.offline {
    --gscale: 1;
  }
}
</style>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from "vue-property-decorator";
import { Part, StateChangeEvent, ValueChangeEvent } from "./vessel";

@Component
export default class TileComponent extends Vue {
  @PropSync("value") part!: Part;
  @Prop({ default: false }) draggable!: boolean;

  private modifier: number | null = null;
  private modifierStack: number[] = [];
  private isOnline = true;

  get classes() {
    let cls = [];
    if (this.part.type) {
      cls.push(this.part.type);
    }
    if (!this.isOnline) {
      cls.push("offline");
    }
    return cls;
  }

  mounted() {
    this.part.event.on<ValueChangeEvent>(
      "afterDamage",
      (evt) => this.addModifier(-Math.abs(evt.data.value - evt.data.oldValue)),
      "tile"
    );
    this.part.event.on<ValueChangeEvent>(
      "afterRepair",
      (evt) => this.addModifier(Math.abs(evt.data.value - evt.data.oldValue)),
      "tile"
    );
    this.part.event.on<ValueChangeEvent>(
      "afterDefine",
      (evt) => this.addModifier(evt.data.value - evt.data.oldValue),
      "tile"
    );
    this.part.event.on<StateChangeEvent>(
      "afterStateChange",
      (evt) => {
        this.isOnline = ["OFFLINE", "DESTROYED"].indexOf(evt.data.state) === -1;
      },
      "tile"
    );

    this.isOnline = ["OFFLINE", "DESTROYED"].indexOf(this.part.state) === -1;
  }

  destroyed() {
    this.part.event.off("tile");
  }

  startDrag(evt: DragEvent) {
    if (this.draggable) {
      console.log("tile drag");
      this.$emit("ondrag", this.part);
    } else {
      evt.preventDefault();
    }
  }

  addModifier(modifier: number) {
    this.modifierStack.push(modifier);
  }

  applyModifiers() {
    if (this.modifier === null) {
      this.modifier = this.modifierStack.shift() ?? null;
      this.$forceUpdate();
    }
  }

  endModifier() {
    this.modifier = null;
    if (this.modifierStack.length) {
      setTimeout(() => {
        this.modifier = this.modifierStack.shift() ?? null;
        this.$forceUpdate();
      }, 400);
    }
  }
}
</script>