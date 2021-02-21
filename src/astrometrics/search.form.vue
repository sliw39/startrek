<template>
  <div class="astrometrics-search">
    <div class="search">
      <input type="text" @keyup="search" v-model="data" />
    </div>
    <div class="results">
      <div
        class="result"
        @click="select(result)"
        v-for="result in results"
        :key="result.id"
      >
        <span :class="result.icon"></span>
        <span>{{ result.text }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.astrometrics-search {
  position: relative;

  .search {
    height: 36px;
    width: 100%;
  }

  .results {
    display: flex;
    flex-flow: column nowrap;

    position: absolute;
    top: 40px;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;

    > .result {
      display: flex;
      flex-flow: row nowrap;
      height: 30px;
      padding-left: 5px;
      align-items: center;
      cursor: pointer;
      user-select: none;

      .icon-system,
      .icon-star {
        height: 15px;
        width: 15px;
        margin: 0 10px 0 5px;
      }

      .icon-system {
        background-color: red;
      }
      .icon-star {
        background-color: green;
      }
    }
  }
}
</style>

<script lang="ts">
import { result } from "lodash";
import Vue from "vue";
import { Component, Emit, Watch, Prop } from "vue-property-decorator";
import { CelestialIo, SystemIo } from "./astrometrics.service";

interface SelectData {
  id: string;
  text: string;
  icon: string;
}

@Component
export default class FormCelestial extends Vue {
  @Prop({ type: String, required: false }) value!: string;
  data = "";
  results: SelectData[] = [];

  async search() {
    if (this.data.length > 2) {
      let [systems, celestials] = await Promise.all([
        SystemIo.find(this.data, false),
        CelestialIo.find(this.data),
      ]);
      let results: SelectData[] = [];
      for (let sys of systems) {
        results.push({
          id: sys._uid,
          text: sys.names[0],
          icon: "icon-system",
        });
      }
      for (let cel of celestials) {
        results.push({
          id: cel._uid,
          text: cel.names[0],
          icon: "icon-star",
        });
      }
      if (results.length === 0) {
        results.push({
          id: "NEW",
          text: "Nouveau system",
          icon: "icon-system",
        });
      }
      this.results = results;
    }
  }

  @Emit("value")
  select(result: SelectData) {
    this.data = result.text;
    this.results = [];
    return result.id;
  }

  @Watch("value")
  async onValueChange(newval: string) {
    let sys = await SystemIo.get(newval);
    if (sys) {
      this.data = sys.names[0];
      return;
    }
    let cel = await CelestialIo.get(newval);
    if (cel) {
      this.data = cel.names[0];
      return;
    }
  }
}
</script>

