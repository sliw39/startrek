<template>
  <div class="celestrial-form">
    <div class="row main-name">
      <span>Nom standard</span>
      <input type="text" v-model="obj.names[0]" />
    </div>
    <span>Autres noms</span>
    <div
      class="row names"
      v-for="(name, i) in obj.names.slice(1)"
      :key="'sysname_' + i"
    >
      <span class="spacer">&nbsp;</span>
      <input type="text" v-model="obj.names[i + 1]" />
      <button-component
        :corners="6"
        color="red"
        @click="obj.names.splice(i + 1, 1)"
        >X</button-component
      >
    </div>
    <button-component class="add-name" color="green" @click="obj.names.push('')"
      >+ Nouveau nom</button-component
    >
    <form-orbital-properties v-model="obj.orbital"></form-orbital-properties>
    <form-appearance v-model="obj.appearance"></form-appearance>
    <form-physical-properties v-model="obj.physical"></form-physical-properties>
    
    <button-component @click="$emit('save')" color="green">Enregistrer</button-component>
    <button-component @click="$emit('remove')" color="red" v-if="obj._uid">Supprimer</button-component>
  </div>
</template>

<style lang="less">
.celestrial-form {
  display: flex;
  flex-direction: column;
  .names {
    > input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    > .btn {
      margin: 0 3px;
      padding: 0;
      min-width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }
  }
  .add-name {
    width: 190px;
    align-self: flex-end;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Prop, Component, PropSync } from "vue-property-decorator";
import { CelestialObject } from "../map/objects.model";
import FormOrbitalProperties from "./orbital-properties.form.vue";
import FormAppearance from "./appearance.form.vue";
import FormPhysicalProperties from "./physical-properties.form.vue";

@Component({
  components: { FormOrbitalProperties, FormAppearance, FormPhysicalProperties },
})
export default class FormCelestrial extends Vue {
  @PropSync("value", CelestialObject) obj!: CelestialObject;
}
</script>