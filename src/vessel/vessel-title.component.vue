
<template>
  <div class="vessel-title">
    <img :src="imageSource(ship.faction)" :alt="ship.faction" />&nbsp;{{
      ship.class
    }}&nbsp;-&nbsp;{{ ship.designation }}&nbsp;{{ ship.name }}
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { PropSync } from "vue-property-decorator";
import { LOGO, foldHomonyms } from "../diplomacy/factions";
import { VesselDesc } from "./vessel";

@Component
export default class VesselTitleComponent extends Vue {
  @PropSync("value", Object) ship!: VesselDesc;

  imageSource(faction: string) {
    return LOGO[foldHomonyms(faction.toLowerCase())];
  }
}
</script>

<style lang="less">
.vessel-title {
  flex: 1;
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 2em;
  padding-left: 1em;

  img {
    filter: invert(1);
    height: 1.5em;
  }
}
</style>