<template>
<div class="shipyard">
    <tileset-component class="buildport" v-model="grid"
         @dropitem="onDrop"
         @itemdblclick="remove"></tileset-component>
    <library-component class="library" @itemdrag="onDrag"></library-component>
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

@Component({
    components: { TilesetComponent, LibraryComponent }
})
export default class ShipyardComponent extends Vue {
    grid = new Vessel();
    draggedItem!: Part;

    created() {
        this.grid.addCell(new EnergyPart(new Grid(3,3), "matrice de dilithium", 6));
        this.grid.addCell(new EnergyPart(new Grid(4,3), "matrice de dilithium 4", 6));
        this.grid.addCell(new EnergyPart(new Grid(3,4), "matrice de dilithium 2", 6));
        this.grid.addCell(new EnergyPart(new Grid(5,5), "matrice de dilithium 3", 6));
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

    remove({item}: {item: Part}) {
        this.grid.removeCell(item);
    }
}
</script>