<template>
<div>
    <div class="ship-detail" v-if="selectedShip">
        <div class="actions">
            <button-component @click="gotoList" color="red" :corners="4">Retour</button-component>
            <button-component @click="saveShip" color="green" :corners="6">Enregistrer</button-component>
        </div>
        <shipyard-component ref="shipyard" v-model="selectedShip"></shipyard-component>
    </div>
    <div class="ship-list" v-else>
        <table>
            <tr v-for="vessel in vessels" :key="vessel._uid" @click="selectedShip = vessel">
                <td><img :src="imageSource(vessel.faction)" :alt="vessel.faction"></td>
                <td>{{vessel.class}}</td>
                <td>{{vessel.designation}}</td>
                <td>{{vessel.name}}</td>
            </tr>
        </table>
    </div>    
</div>
</template>

<style lang="less">
.ship-list {
    img {
        filter: invert(1);
        height: 2em;
    }
}

.ship-detail {
    display: flex;
    flex-flow: column nowrap;

    >.actions {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
    }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Ref } from "vue-property-decorator";
import ShipyardComponent from "./shipyard-component.vue";
import { VesselDesc } from "./vessel";
import { VesselLibrary } from "./vessel-library.service";

@Component({
    components: {ShipyardComponent}
})
export default class VesselLibraryComponent extends Vue {
    vessels: VesselDesc[] = [];
    selectedShip: VesselDesc|null = null;

    @Ref("shipyard") shipyard!: ShipyardComponent;

    async created() {
        this.vessels = await VesselLibrary.listClasses();
    }

    imageSource(faction: string) {
        let img = faction.toLowerCase();

        switch(img) {
            case "humain":
            case "human":
                img = "starfleet"; break;
        }

        return `static/${img}.png`;
    }

    async saveShip() {
        await this.shipyard.save();
        this.gotoList();
    }

    gotoList() {
        this.selectedShip = null;
    }
}

</script>
