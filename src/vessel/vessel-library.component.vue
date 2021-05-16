<template>
  <div>
    <div class="ship-detail" v-if="selectedShip">
      <div class="actions">
        <vessel-title-component v-model="selectedShip"></vessel-title-component>
        <button-component @click="gotoList" color="red" :corners="4"
          >Retour</button-component
        >
        <button-component @click="saveShip" color="green" :corners="6"
          >Enregistrer</button-component
        >
      </div>
      <shipyard-component
        ref="shipyard"
        v-model="selectedShip"
      ></shipyard-component>
    </div>
    <div class="ship-list" v-else>
      <section-component
        title="Vaisseaux connus"
        color="orange"
        :corners="7"
        :borders="4"
      >
        <div class="table">
          <div
            class="ship-row"
            v-for="vessel in vessels"
            :key="vessel._uid"
            @click="selectedShip = vessel"
          >
            <div class="vessel-faction">
              <img :src="imageSource(vessel.faction)" :alt="vessel.faction" />
            </div>
            <div class="vessel-class">{{ vessel.class }}</div>
            <div class="vessel-degignation">{{ vessel.designation }}</div>
            <div class="vessel-name">{{ vessel.name }}</div>
            <div>
              <button-component
                @click="deleteShip(vessel)"
                color="red"
                :corners="6"
                >Effacer</button-component
              >
            </div>
          </div>
        </div>
      </section-component>
      <section-component
        title="Nouveau vaisseau"
        color="green"
        :corners="9"
        :borders="4"
      >
        <vessel-add-component @created="createVessel"></vessel-add-component>
      </section-component>
    </div>
  </div>
</template>

<style lang="less">
.ship-list {
  display: flex;

  img {
    filter: invert(1);
    height: 3em;
  }

  .table {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
  }

  .ship-row {
    cursor: pointer;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    > * {
      padding: 0 1em;
    }
    .vessel-faction {
      flex: 1;
      font-size: 1.3em;
    }
    .vessel-class {
      flex: 1;
      font-size: 1.3em;
    }
    .vessel-degignation {
      flex: 1;
      font-size: 1.3em;
    }
    > .vessel-name {
      flex: 1;
      font-size: 1.3em;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.ship-detail {
  display: flex;
  flex-flow: column nowrap;

  > .actions {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import ShipyardComponent from "./shipyard-component.vue";
import VesselAddComponent from "./vessel-add.component.vue";
import VesselTitleComponent from "./vessel-title.component.vue";
import { Component, Ref } from "vue-property-decorator";
import { VesselDesc } from "./vessel";
import { VesselLibrary } from "./vessel-library.service";

@Component({
  components: { VesselTitleComponent, ShipyardComponent, VesselAddComponent },
})
export default class VesselLibraryComponent extends Vue {
  vessels: VesselDesc[] = [];
  selectedShip: VesselDesc | null = null;

  @Ref("shipyard") shipyard!: ShipyardComponent;

  async created() {
    this.vessels = await VesselLibrary.listClasses();
  }

  async saveShip() {
    await this.shipyard.save();
    this.gotoList();
  }

  gotoList() {
    this.selectedShip = null;
  }

  createVessel(vessel: VesselDesc) {
    this.vessels.push(vessel);
    this.selectedShip = vessel;
  }

  async deleteShip(vessel: VesselDesc) {
    let v = await VesselLibrary.loadClass(vessel);
    if (v) {
      await VesselLibrary.deleteClass(v);
      this.vessels = await VesselLibrary.listClasses();
    }
  }
}
</script>
