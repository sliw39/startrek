<template>
  <div class="map">
    <toolbar-component class="toolbar" />
    <viewport-component />
  </div>
</template>

<style lang="less">
.map {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  > * {
    flex: 1;
  }

  .toolbar {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
  }
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { CollapsibleElement } from "../framework/collapsible-component";
import ViewportComponent from "./viewport-component.vue";
import ToolbarComponent from "./toolbar-component.vue";
import SettingsComponent from "./settings-component.vue";
import map from "./map.module";
import { StarsImg } from "../astrometrics/astrometrics.utils";

@Component({
  components: { ViewportComponent, ToolbarComponent, SettingsComponent },
})
export default class MapComponent extends Vue {}
</script>