<template>
  <div class="select">
    <div class="selected-value" ref="selected-value" @click="displayOptions">
      {{ value }}
    </div>
    <div
      class="select-options-container"
      ref="select-options-container"
      :class="{ visible: showOptions }"
    >
      <div
        class="select-option"
        @click="select(option)"
        v-for="option in options"
        :key="option"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<style lang="less">
.select {
  position: relative;

  .selected-value {
    height: 36px;
    cursor: pointer;
  }
  .select-options-container {
    position: absolute;
    top: 36px;
    left: -10px;
    width: 100px;
    background-color: black;
    border: 1px solid white;
    padding-left: 15px;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    z-index: 1000;

    &.visible {
      display: flex;
      flex-flow: column nowrap;
    }
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Ref, Component, Prop, Emit } from "vue-property-decorator";

const isVisible = (elem: HTMLElement) =>
  !!elem &&
  !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);

function hideOnClickOutside(element: HTMLElement, cb: Function) {
  const outsideClickListener = (event: MouseEvent) => {
    if (
      event.target &&
      element &&
      !element.contains(<Node>event.target) &&
      isVisible(element)
    ) {
      removeClickListener();
      cb();
    }
  };

  const removeClickListener = () => {
    document.removeEventListener("click", outsideClickListener);
  };

  document.addEventListener("click", outsideClickListener);
  return removeClickListener;
}

@Component
export default class SelectComponent extends Vue {
  showOptions = false;
  outListener: Function | null = null;

  @Prop(String) value!: string;
  @Prop({ type: Array, default: [] }) options!: string[];

  @Ref() selectedValue!: HTMLElement;
  @Ref() selectOptionsContainer!: HTMLElement;

  displayOptions() {
    this.outListener = hideOnClickOutside(this.selectOptionsContainer, () => {
      this.showOptions = false;
    });
    this.showOptions = true;
  }

  @Emit("input")
  select(option: string) {
    if (this.outListener) {
      this.outListener();
    }
    this.showOptions = false;
    return option;
  }
}

Vue.component("select-component", SelectComponent);
</script>