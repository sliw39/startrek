<template>
<div class="tileset">
    <div class="row" v-for="i in 6" :key="i" :class="{'odd' : i%2 === 0}">
        <div class="cell" v-for="j in 6" :key="j">
            <tile-component 
                v-if="itemAt(i, j)"
                :part="itemAt(i, j)" 
                :key="j"></tile-component>
            <div class="empty-cell" v-else></div>
        </div>
    </div>
</div>
</template>
 
<style lang="less">
.tileset {
    display: flex;
    flex-flow: column nowrap;
    font-size: .3em;

    .row {
        display: flex;
        flex-flow: row nowrap;
        margin-bottom: -6em;

        &.odd {
            margin-left: 10.28em;
        }

        .cell {
            height: 12em;
            width: 20.6em;

            .hexagon {
                transition: all .2s ease-in-out;
                z-index: 1;
                &:hover {
                    transform: scale(1.3);
                    filter: drop-shadow(0 0 0.75rem rgb(109, 89, 93));
                    z-index: 10;
                }
            }

            .empty-cell {
                // background-color: rgb(177, 58, 107);
                height: 12em;
                width: 6.9em;
                margin: auto;
                background-color: black;
                filter: drop-shadow(0 0 .4rem rgb(255, 255, 255));
                
                &::before,
                &::after {
                    position: absolute;
                    content: "";
                    background: inherit;
                    height: 100%;
                    width: 100%;
                    border-radius: 0;
                    transform-origin: center;
                }
                &::before {
                    transform: rotateZ(60deg);
                }
                &::after {
                    transform: rotateZ(-60deg);
                }
            }
        }
    }   
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Grid } from "./hexagon";
import TileComponent from "./tile-component.vue";
import { EnergyPart, Vessel } from "./vessel";

@Component({
    components: {TileComponent}
})
export default class TilesetComponent extends Vue {
    grid = new Vessel();

    itemAt(i: number, j: number) {
        return this.grid.get(new Grid(i, j));
    }

    created() {
        this.grid.addCell(new EnergyPart(new Grid(3,3), "matrice de dilithium", 6));
        this.grid.addCell(new EnergyPart(new Grid(4,3), "matrice de dilithium 4", 6));
        this.grid.addCell(new EnergyPart(new Grid(3,4), "matrice de dilithium 2", 6));
        this.grid.addCell(new EnergyPart(new Grid(5,5), "matrice de dilithium 3", 6));
    }
}
</script>