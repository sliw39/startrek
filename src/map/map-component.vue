<template>
    <div class="map">
        <viewport-component :zoom="zoom" @selected="selectedElement = $event"/>
        <toolbar-component v-model="zoom"/>
    </div>
</template>

<style lang="less" >
 .map {
    height: 100%;
    width: 100%;
 }
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import ViewportComponent from "./viewport-component.vue";
import ToolbarComponent from "./toolbar-component.vue";
import { System } from "./objects.model";

@Component({
  components: { ViewportComponent, ToolbarComponent }
})
export default class MapComponent extends Vue {
  zoom = 1.0;
  selectedElement!: System;
}
</script>