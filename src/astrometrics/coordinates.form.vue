<template>
<div class="form-coordinate">
    <input type="number" v-model.number="coordinates.x">
    <span>/</span>
    <input type="number" v-model.number="coordinates.y">
    <span>&nbsp;</span>
    <span v-if="availableUnits.length === 1">{{coordinates.unit}}</span>
    <select-component v-else v-model="coordinates.unit" :options="availableUnits"></select-component>
</div>
</template>

<style lang="less">
.form-coordinate {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    > * {
        margin-right: 10px;
    }
}
</style>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component, PropSync } from 'vue-property-decorator';
import { Coordinate, DistanceUnit } from '../map/objects.model';

@Component
export default class FormCoordinates extends Vue {
    @PropSync("value", Object) coordinates!: Coordinate;
    @Prop({type: Array, default: ["km", "mkm", "ua", "al"]}) availableUnits!: DistanceUnit[]
}
</script>