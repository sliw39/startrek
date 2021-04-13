<template>
<div class="shipyard">
    <tileset-component class="buildport" v-model="grid"
         @dropitem="onDrop"
         @itemdblclick="remove"></tileset-component>
    <library-component class="library" @itemdrag="onDrag"></library-component>
    <button-component @click="save">Enregistrer</button-component>
</div>
</template>

<style lang="less">
.shipyard {
    display: flex;
    flex-flow: row nowrap;

    >.buildport {
        flex: 1;
    }

    >.library {
        max-width: 500px;
    }
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TilesetComponent from "./tileset-component.vue";
import LibraryComponent from "./library-component.vue";
import { EnergyPart, Part, Vessel } from "./vessel";
import { Grid } from "./hexagon";
import { VesselLibrary } from "./vessel-library.service";
import _ from "lodash";

@Component({
    components: { TilesetComponent, LibraryComponent }
})
export default class ShipyardComponent extends Vue {
    grid: Vessel = new Vessel();
    draggedItem!: Part;

    async created() {
        const desc = {
            faction: "Humain",
            class: "Constitution",
            designation: "NCC 1701",
            name: "USS Enterprise"
        };
        let v = await VesselLibrary.loadClass(desc);
        if(!v) {
            v = new Vessel();
            _.assign(v, desc);
            VesselLibrary.saveClass(v);
        }
        this.grid = v;
    }

    onDrag(payload: Part) {
        console.log("ondrag")
        this.draggedItem = payload;
    }

    onDrop({x, y}: {x: number, y: number}) {
        console.log("ondrop")
        const coord = new Grid(x, y);
        if(!this.grid.get(coord)) {
            this.grid.addCell(this.draggedItem.newInstance(coord));
            this.$forceUpdate();
        }
    }

    remove(item: Part) {
        this.grid.removeCell(item);
    }

    async save() {
        return await VesselLibrary.saveClass(this.grid);
    }
}
</script>