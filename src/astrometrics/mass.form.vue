<template>
    <div class="form-mass">
        <template v-if="readonly">
            <span>{{mass.get(selectedUnit)}}</span>
            <select-component :options="allowedOptions" v-model="selectedUnit"></select-component>
        </template>
        <template v-else>
            <input type="number" :value="mass.get()" @input="update">
            <select-component :options="allowedOptions" :value="mass.unit" @input="setUnit"></select-component>
        </template>
    </div>
</template>

<style lang="less">
.form-mass {
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
import { Mass, MassUnit } from '../map/objects.model'
import _ from "lodash";

@Component
export default class FormMass extends Vue {
    @PropSync("value", Mass) mass!: Mass;
    @Prop({type: Array, default: () => ["g", "kg", "ton", "kton", "moon", "earth", "jupiter", "sun"]}) allowedOptions!: MassUnit[]
    @Prop({type: Boolean, default: false}) readonly!: boolean;

    selectedUnit!: MassUnit;

    mounted() {
        if(this.readonly) {
            this.selectedUnit = this.mass.unit;
        }
    }

    update = _.debounce(($event: InputEvent) => {
        if(!$event.data) {
            return;
        }
        this.$emit("input", new Mass(parseFloat($event.data), this.mass.unit));
    }, 500);

    @Emit("input")
    setUnit($event: Event, data: MassUnit) {
        return this.mass.get(data);
    }
}
</script>