<template>
  <div class="collapsible-container" :class="direction">
    <span class="lifeline"></span>
    <div class="element element-main" @click="onClick">
      <div class="title">{{ main.title }}</div>
      <img
        :src="main.img"
        v-if="main.img"
        :style="{
          padding: relativeSize(main.size, siblings),
        }"
      />
      <div class="alt-img" v-else></div>
    </div>
    <transition name="collapsible">
      <div class="satelites" v-if="!collapsed">
        <template v-for="(satelite, i) in main.satelites">
          <collapsible-component
            v-if="satelite.satelites && satelite.satelites.length"
            v-model="main.satelites[i]"
            :siblings="main.satelites"
            :direction="direction === 'vertical' ? 'horizontal' : 'vertical'"
            :key="satelite.id"
            :edit="edit"
            @addsatelite="addSatelite"
            @click="$emit('click', $event)"
          >
          </collapsible-component>
          <div
            class="element element-main"
            v-else
            :key="satelite.id"
            @click="onSatClick(satelite)"
          >
            <div class="title">{{ satelite.title }}</div>
            <img
              :src="satelite.img"
              v-if="satelite.img"
              :style="{
                padding: relativeSize(satelite.size),
              }"
            />
            <div class="alt-img" v-else></div>
            <button-component
              v-for="type in SystemStruc[satelite.type]"
              :key="type"
              class="add-elt"
              :class="direction === 'vertical' ? 'horizontal' : 'vertical'"
              color="green"
              @click="addSatelite({parent: satelite, type: type})"
              >+</button-component
            >
          </div>
        </template>
        <button-component
          v-for="type in SystemStruc[main.type]"
          :key="type"
          class="add-elt"
          color="green"
          @click="addSatelite({parent: main, type: type})"
          >+</button-component
        >
      </div>
    </transition>
  </div>
</template>

<style lang="less">
.collapsible-container {
  display: flex;
  position: relative;
  align-items: flex-start;

  .element.element-main {
    position: relative;
    min-width: 100px;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 5px;
    z-index: 1;
    cursor: pointer;

    .title,
    img,
    .img-alt {
      background-color: black;
      z-index: 1;
    }
    img {
      height: 100px;
      width: 100px;
      box-sizing: border-box;
    }

    > .vertical {
      &.add-elt {
        height: 20px;
        width: 100px;
        left: 10px;
      }
    }
    > .horizontal {
      &.add-elt {
        width: 20px;
        height: 100px;
        top: 20px;
        right: -20px;
        left: auto;
      }
    }
  }

  .add-elt {
    padding: 0;
    margin: 0;
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    position: absolute;
    min-width: 0;
  }

  &.vertical {
    flex-direction: column;

    .add-elt {
      height: 20px;
      width: 100px;
      left: 10px;
    }

    .lifeline {
      left: 55px;
      width: 3px;
      top: 5px;
      bottom: 5px;
    }
  }
  &.horizontal {
    flex-direction: row;

    .add-elt {
      width: 20px;
      height: 100px;
      top: 10px;
    }

    .lifeline {
      top: 55px;
      height: 3px;
      left: 5px;
      right: 5px;
    }
  }

  .lifeline {
    position: absolute;
    background-color: white;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit, PropSync } from "vue-property-decorator";
import { CollapsibleElement, SystemStruc } from "./collapsible-component";

@Component
export default class CollapsibleComponent extends Vue {
  @PropSync("value", Object) main!: CollapsibleElement;
  @Prop({ type: String, default: "vertical" }) direction!:
    | "vertical"
    | "horizontal";
  @Prop({ type: Object, required: false }) siblings!: CollapsibleElement[];
  @Prop({ type: Boolean, default: false }) edit!: boolean;
  collapsed = false;

  @Emit("click")
  onClick() {
    this.collapsed = !this.collapsed;
    return this.main;
  }

  @Emit("click")
  onSatClick(satelite: CollapsibleElement) {
    return satelite;
  }

  SystemStruc = SystemStruc;

  relativeSize(radius: number, siblings?: CollapsibleElement[]) {
    let max = Math.max(
      ...(siblings || this.main.satelites || ([] as CollapsibleElement[])).map(
        (d) => d.size || 0
      )
    );
    return 50 - Math.max(0.1, radius / max) * 50 + "px";
  }

  addSatelite(data: {
    parent: CollapsibleElement, 
    type: string 
  }) {
    this.$emit("addsatelite", data);
  }
}

Vue.component("collapsible-component", CollapsibleComponent);
</script>