<template>
<div class="tileset">
    <div class="row" v-for="i in width" :key="i" :class="{'odd' : i%2 === 0}">
        <div class="cell" v-for="j in height" :key="j">
            <tile-component 
                v-if="itemAt(i, j)"
                :value="itemAt(i, j)" 
                :key="j"
                :title="itemAt(i, j).position.grid.hash"
                @dblclick.native="$emit('itemdblclick', itemAt(i, j))"></tile-component>
            <div v-else 
                class="empty-cell"
                :title="'g' + i + ':' + j"
                @drop="$emit('dropitem', {x:i, y:j})" 
                @dragover.prevent
                @dragenter.prevent></div>
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
import { Component, PropSync, Vue, Watch } from "vue-property-decorator";
import { Grid } from "./hexagon";
import { Vessel } from "./vessel";
import TileComponent from "./tile-component.vue";

@Component({
    components: {TileComponent}
})
export default class TilesetComponent extends Vue {

    @PropSync("value") grid!: Vessel;

    itemAt(i: number, j: number) {
        return this.grid.get(new Grid(i, j));
    }

    get height() {
        return Math.max(this.grid.rect.height + 1, 2);
    }
    get width() {
        return Math.max(this.grid.rect.width + 2, 6);
    }

    @Watch("grid", {deep: true})
    updateGrid() {
        this.$forceUpdate();
    }
}
</script>