<template>
  <div class="battle-turn">
    <div v-if="vessel1">
      <vessel-title-component v-model="vessel1"></vessel-title-component>
      <tileset-component v-model="vessel1"></tileset-component>
    </div>
    <div v-if="vessel2">
      <vessel-title-component v-model="vessel2"></vessel-title-component>
      <tileset-component v-model="vessel2"></tileset-component>
    </div>
    <div class="overlay"></div>
  </div>
</template>

<style lang="less">
.battle-turn {
  display: flex;
  flex-flow: row nowrap;
  position: relative;

  > div {
    margin: 0 10px;
  }

  .overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    top: 0;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TilesetComponent from "../vessel/tileset-component.vue";
import VesselTitleComponent from "../vessel/vessel-title.component.vue";
import { PropSync } from "vue-property-decorator";
import { Damages } from "./battle-engine";

@Component({
  components: { TilesetComponent, VesselTitleComponent },
})
export default class BattleTurnComponent extends Vue {
  @PropSync("value", Object) damages!: Damages;

  get vessel1() {
    return this.damages.attack.source.vessel.vessel;
  }

  get vessel2() {
    return this.damages.attack.target.vessel.vessel;
  }

  mounted() {
    setTimeout(() => this.$emit("end"), 2000);
  }

  updated() {
    setTimeout(() => this.$emit("end"), 2000);
  }
}
</script>