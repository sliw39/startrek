<template>
  <div class="astrometrics-form">
    <div class="overview">
      <search-form @value="selectSystem"></search-form>
      <collapsible-component
        v-if="selectedSystem"
        v-model="selectedSystem"
        :edit="true"
        @addsatelite="addSatelite"
        @click="selectItem"
      ></collapsible-component>
    </div>
    <div class="forms-container" v-if="selectedSystem">
      <celestial-form
        v-if="selectedData"
        v-model="selectedData"
        @save="save"
        @remove="remove"
      ></celestial-form>
      <system-form v-else v-model="selectedSystemData"
        @save="saveSystem"
        @remove="removeSystem"
      ></system-form>
    </div>
  </div>
</template>

<style lang="less">
.astrometrics-form {
  display: flex;
  height: 100%;

  > .overview {
    flex: 1;
    overflow: auto;

    .astrometrics-search {
      width: 160px;
    }
  }

  .forms-container {
    .row {
      > span:first-of-type {
        width: 200px;
      }
    }
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { CollapsibleElement } from "../framework/collapsible-component";
import {
  Appearance,
  CelestialObject,
  OrbitalProperties,
  parseCelestial,
  PhysicalProperties,
  System,
} from "../map/objects.model";
import { CelestialIo, SystemIo } from "./astrometrics.service";
import { StarsImg } from "./astrometrics.utils";
import SearchForm from "./search.form.vue";
import CelestialForm from "./celestial.form.vue";
import SystemForm from "./system.form.vue";

@Component({
  components: { SearchForm, CelestialForm, SystemForm },
})
export default class AstrometricsComponent extends Vue {
  selectedSystem: CollapsibleElement | null = null;
  selectedSystemData: System | null = null;
  selectedData: CelestialObject | null = null;

  mounted() {
    if(this.$route.params.uid) {
      this.selectSystem(this.$route.params.uid);
    }
  }

  async selectItem(system: CollapsibleElement) {
    if (system.type !== "System") {
      let s = await CelestialIo.get(system.id);
      if (s) {
        this.selectedData = s;
      }
    }
  }

  async selectSystem(uid: string) {
    let sys: System | undefined;
    if (uid === "NEW") {
      sys = System.defaultSystem();
    } else if(await SystemIo.exists(uid)) {
      sys = await SystemIo.get(uid);
    } else {
      let cel = await CelestialIo.get(uid);
      if(cel) {
        sys = await CelestialIo.getSystem(cel);
      }
    }
    if (!sys) {
      return;
    }
    this.selectedSystemData = sys;

    let system: CollapsibleElement = {
      id: sys._uid,
      title: sys.names[0],
      size: sys.mass.sun,
      type: sys.constructor.name,
      satelites: await this.celestialTree(sys.objects),
    };
    this.selectedSystem = system;
  }

  addSatelite(data: { parent: CollapsibleElement; type: string }) {
    this.selectedData = parseCelestial({
      _type: data.type,
      names: [""],
      orbital: OrbitalProperties.origin().serialize(),
      physical: new PhysicalProperties().serialize(),
      appearance: new Appearance(1).serialize(),
    });
    this.selectedData._parent = data.parent.id;
  }

  async celestialTree(cel: CelestialObject[]) {
    let results: CollapsibleElement[] = [];
    for (let obj of cel.sort(
      (a, b) => a.orbital.semiMajorAxis.ua - b.orbital.semiMajorAxis.ua
    )) {
      let sat = {
        id: obj._uid,
        title: obj.names[0],
        size: obj.physical.radius.mkm,
        type: obj.constructor.name,
        img: StarsImg.find((d) => d.key === obj.appearance.oclass)?.url,
      } as CollapsibleElement;
      let children = await CelestialIo.getChildren(obj._uid);
      if (children && children.length) {
        sat.satelites = await this.celestialTree(children);
      }
      results.push(sat);
    }
    return results;
  }

  async save() {
    if (this.selectedData && this.selectedSystem) {
      let system = await SystemIo.get(this.selectedData._parent);
      if (system) {
        system.objects = system.objects.filter(
          (o) => o._uid !== this.selectedData?._uid
        );
        system.objects.push(this.selectedData);
        await SystemIo.upsert(system);
      } else {
        await CelestialIo.upsert(this.selectedData);
      }
      await this.selectSystem(this.selectedSystem.id);
    }
  }

  async remove() {
    if (this.selectedData && this.selectedSystem) {
      await CelestialIo.remove(this.selectedData._uid);
      let system = await SystemIo.get(this.selectedData._parent);
      if (system) {
        let idx = system.objects.findIndex(
          (s) => s._uid === this.selectedData?._uid
        );
        if (idx >= 0) {
          system.objects.splice(idx, 1);
          await SystemIo.upsert(system);
        }
      }
      this.selectedSystem = null;
    }
  }

  async saveSystem() {
    let system = this.selectedSystemData;
    if(system) {
        return await SystemIo.upsert(system);
    }
  }

  async removeSystem() {
      console.error("NIY")
  }
}
</script>