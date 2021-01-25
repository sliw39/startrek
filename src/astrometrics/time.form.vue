<template>
    <div class="form-time">
        <template v-if="readonly">
            <span>{{time.get(selectedUnit)}}</span>
            <select-component :options="allowedOptions" v-model="selectedUnit"></select-component>
        </template>
        <template v-else>
            <input type="number" :value="time.get()" @input="update">
            <select-component :options="allowedOptions" :value="time.unit" @input="setUnit"></select-component>
        </template>
    </div>
</template>

<style lang="less">
.form-time {
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
import { Time, TimeUnit } from '../map/objects.model'
import _ from "lodash";

@Component
export default class FormTime extends Vue {
    @PropSync("value", Time) time!: Time;
    @Prop({type: Array, default: () => ["ms", "s", "m", "h", "d", "w", "y"]}) allowedOptions!: TimeUnit[]
    @Prop({type: Boolean, default: false}) readonly!: boolean;

    selectedUnit!: TimeUnit;

    mounted() {
        if(this.readonly) {
            this.selectedUnit = this.time.unit;
        }
    }

    update = _.debounce(($event: InputEvent) => {
        if(!$event.data) {
            return;
        }
        this.$emit("input", new Time(parseFloat($event.data), this.time.unit));
    }, 500);

    @Emit("input")
    setUnit($event: Event, data: TimeUnit) {
        return this.time.get(data);
    }
}
</script>