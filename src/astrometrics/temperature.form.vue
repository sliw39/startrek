<template>
    <div class="form-temperature">
        <template v-if="readonly">
            <span>{{temperature.get(selectedUnit)}}</span>
            <select-component :options="allowedOptions" v-model="selectedUnit"></select-component>
        </template>
        <template v-else>
            <input type="number" :value="temperature.get()" @input="update">
            <select-component :options="allowedOptions" :value="temperature.unit" @input="setUnit"></select-component>
        </template>
    </div>
</template>

<style lang="less">
.form-temperature {
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
import { Temperature, TemperatureUnit } from '../map/objects.model'
import _ from "lodash";

@Component
export default class FormTemperature extends Vue {
    @PropSync("value", Temperature) temperature!: Temperature;
    @Prop({type: Array, default: () => ["K", "C", "F"]}) allowedOptions!: TemperatureUnit[]
    @Prop({type: Boolean, default: false}) readonly!: boolean;

    selectedUnit!: TemperatureUnit;

    mounted() {
        if(this.readonly) {
            this.selectedUnit = this.temperature.unit;
        }
    }

    update = _.debounce(($event: InputEvent) => {
        if(!$event.data) {
            return;
        }
        this.$emit("input", new Temperature(parseFloat($event.data), this.temperature.unit));
    }, 500);

    @Emit("input")
    setUnit($event: Event, data: TemperatureUnit) {
        return this.temperature.get(data);
    }
}
</script>