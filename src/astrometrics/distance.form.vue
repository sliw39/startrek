<template>
    <div class="form-distance">
        <template v-if="readonly">
            <span>{{distance.get(selectedUnit)}}</span>
            <select-component :options="allowedOptions" v-model="selectedUnit"></select-component>
        </template>
        <template v-else>
            <input type="number" :value="distance.get()" @input="update">
            <select-component :options="allowedOptions" :value="distance.unit" @input="setUnit"></select-component>
        </template>
    </div>
</template>

<style lang="less">
.form-distance {
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
import { Prop, Component, PropSync, Emit } from 'vue-property-decorator'
import { Distance, DistanceUnit } from '../map/objects.model'
import _ from "lodash";

@Component
export default class FormDistance extends Vue {
    @PropSync("value", Distance) distance!: Distance;
    @Prop({type: Array, default: () => ["km", "mkm", "ua", "al"]}) allowedOptions!: DistanceUnit[]
    @Prop({type: Boolean, default: false}) readonly!: boolean;

    selectedUnit!: DistanceUnit;

    mounted() {
        if(this.readonly) {
            this.selectedUnit = this.distance.unit;
        }
    }

    update = _.debounce(($event: InputEvent) => {
        if(!$event.data) {
            return;
        }
        this.$emit("input", new Distance(parseFloat($event.data), this.distance.unit));
    }, 500);

    @Emit("input")
    setUnit($event: Event, data: DistanceUnit) {
        return this.distance.get(data);
    }
}
</script>