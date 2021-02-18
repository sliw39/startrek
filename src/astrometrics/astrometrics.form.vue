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
    <div class="forms-container" v-if="selectedData">
      <celestrial-form v-model="selectedData" @save="save" @remove="remove"></celestrial-form>
    </div>
  </div>
</template>

<style lang="less">
.astrometrics-form {
  display: flex;

  > .overview {
    flex: 1;

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
  parseCelestrial,
  PhysicalProperties,
} from "../map/objects.model";
import { CelestrialIo, SystemIo } from "./astrometrics.service";
import { StarsImg } from "./astrometrics.utils";
import SearchForm from "./search.form.vue";
import CelestrialForm from "./celestrial.form.vue";

@Component({
  components: { SearchForm, CelestrialForm },
})
export default class AstrometricsComponent extends Vue {
  selectedSystem: CollapsibleElement | null = null;
  selectedData: CelestialObject | null = null;

  async selectItem(system: CollapsibleElement) {
      if(system.type !== "System") {
          let s = await CelestrialIo.get(system.id);
          if(s) {
              this.selectedData = s;
          }
      }
  }

  async selectSystem(uid: string) {
    let sys = await SystemIo.get(uid);
    if (sys) {
      let system: CollapsibleElement = {
        id: sys._uid,
        title: sys.names[0],
        size: sys.mass.sun,
        type: sys.constructor.name,
        satelites: [],
      };
      for (let obj of sys.objects) {
        system.satelites?.push({
          id: obj._uid,
          title: obj.names[0],
          size: obj.physical.radius.mkm,
          type: obj.constructor.name,
          img: StarsImg.find((d) => d.key === obj.appearance.oclass)?.url,
        });
      }
      this.selectedSystem = system;
    }
  }

  addSatelite(data: {parent: CollapsibleElement, type: string}) {
    this.selectedData = parseCelestrial({
        _type: data.type,
        names: [""],
        orbital: OrbitalProperties.origin().serialize(),
        physical: new PhysicalProperties().serialize(),
        appearance: new Appearance(1).serialize()
    });
    this.selectedData._parent = data.parent.id;
  }

  async save() {
    if (this.selectedData && this.selectedSystem) {
      let system = await SystemIo.get(this.selectedData._parent);
      if (system) {
        system.objects = system.objects.filter(o => o._uid !== this.selectedData?._uid);
        system.objects.push(this.selectedData);
        await SystemIo.upsert(system);
      } else {
        await CelestrialIo.upsert(this.selectedData);
      }
      await this.selectSystem(this.selectedSystem.id);
    }
  }

  async remove() {
    if (this.selectedData && this.selectedSystem) {
      await CelestrialIo.remove(this.selectedData._uid);
      let system = await SystemIo.get(this.selectedData._parent);
      if (system) {
        let idx = system.objects.findIndex(s => s._uid === this.selectedData?._uid);
        if(idx >= 0) {
          system.objects.splice(idx, 1);
          await SystemIo.upsert(system);
        }
      }
      this.selectedSystem = null;
    }
  }
}
</script>