<template>
    <div class="map">
        <toolbar-component class="toolbar"/>
        <viewport-component/>
    </div>
</template>

<style lang="less">
 .map {
    height: 100%;
    width: 100%;
    position: relative;

    .toolbar {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1;
    }
 }
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ViewportComponent from "./viewport-component.vue";
import ToolbarComponent from "./toolbar-component.vue";
import SettingsComponent from "./settings-component.vue";
import { Coordinate, System } from "./objects.model";

@Component({
  components: { ViewportComponent, ToolbarComponent, SettingsComponent }
})
export default class MapComponent extends Vue {}
</script>