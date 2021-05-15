<template>
  <div class="settings">
    <button @click="close">X</button>
    <div class="setting" v-for="key in keys" :key="key">
      <b>{{ key }}</b>
      <input :type="typeof settings[key]" v-model="settings[key]" ></input>
      <button @click="reset(key)">reset</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { System } from "./objects.model";
import {
  CurrentSettings,
  DefaultSettings,
  SettingsKeys,
} from "./settings.model";
import _ from "lodash";

@Component
export default class StarComponent extends Vue {
  settings = CurrentSettings;
  keys = _.keys(CurrentSettings);

  reset(key: SettingsKeys) {
    CurrentSettings[key] = DefaultSettings[key];
  }

  @Emit("close")
  close() {}
}
</script>

<style lang="less">
.settings {
  display: flex;
  flex-direction: column;
  background-color: white;

  .setting {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>