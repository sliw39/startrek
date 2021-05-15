<template>
  <div class="system-form form">
    <div class="row main-name">
      <span>Nom standard</span>
      <input type="text" v-model="system.names[0]" />
    </div>
    <span>Autres noms</span>
    <div
      class="row names"
      v-for="(name, i) in system.names.slice(1)"
      :key="'sysname_' + i"
    >
      <span class="spacer">&nbsp;</span>
      <input type="text" v-model="system.names[i + 1]" />
      <button-component
        :corners="6"
        color="red"
        @click="system.names.splice(i + 1, 1)"
        >Effacer</button-component
      >
    </div>
    <button-component
      class="add-name"
      color="green"
      @click="system.names.push('')"
      >+ Nouveau nom</button-component
    >
    <div class="row main-name">
      <span>Coordonnées</span>
      <form-coordinates
        v-model="system.coordinate"
        :available-units="['al']"
      ></form-coordinates>
    </div>
    <button-component class="action" color="green" @click="$emit('save')"
      >Enregistrer</button-component
    >
    <button-component class="action" color="red" @click="$emit('remove')"
      >Effacer</button-component
    >
  </div>
</template>

<style lang="less">
.system-form {
  .add-name {
    width: 200px;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, PropSync } from "vue-property-decorator";
import { Star, System } from "../map/objects.model";
import FormCoordinates from "./coordinates.form.vue";
import FormCelestial from "./celestial.form.vue";
import _ from "lodash";

@Component({
  components: { FormCoordinates, FormCelestial },
})
export default class FormSystem extends Vue {
  @PropSync("value", { type: System, default: () => System.defaultSystem() })
  system!: System;

  get stars() {
    return _.filter(this.system.objects, (o) => o instanceof Star);
  }
}
</script>