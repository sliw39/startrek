<template>
    <div class="orbital-properties">
        <div class="row">
            <span>Demi-Axe Majeur</span>
            <form-distance v-model="props.semiMajorAxis" :readonly="readonly"></form-distance>
        </div>
        <div class="row">
            <span>Période</span>
            <form-time v-model="props.period" :readonly="readonly"></form-time>
        </div>
        <div class="row">
            <span>Excentricité</span>
            <span v-if="readonly">{{props.excentricity}}</span>
            <input v-else type="number" min="0" max="1" step=".1" v-model="props.excentricity">
        </div>
        <div class="row">
            <span>Inclinaison</span>
            <span v-if="readonly">{{props.tilt}}</span>
            <input v-else type="number" min="0" max="360" step="1" v-model="props.tilt">
        </div>
    </div>
</template>

<style lang="less">

</style>

<script lang="ts">
import Vue from 'vue'
import { Ref, Component, Prop, Emit, PropSync } from 'vue-property-decorator'
import { OrbitalProperties } from '../map/objects.model';
import FormMass from "./mass.form.vue"
import FormDistance from "./distance.form.vue"
import FormTime from "./time.form.vue"

@Component({
    components: { FormMass, FormDistance, FormTime }
})
export default class FormOrbitalProperties extends Vue {
    @PropSync("value", OrbitalProperties) props!: OrbitalProperties;
    readonly = false;
}
</script>