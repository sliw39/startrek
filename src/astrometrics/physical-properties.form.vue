<template>
<div>
    <div class="row">
        <span>Rayon</span>
        <form-distance v-model="props.radius" :readonly="readonly"></form-distance>
    </div>
    <div class="row">
        <span>Masse</span>
        <form-mass v-model="props.mass" :readonly="readonly"></form-mass>
    </div>
    <div class="row">
        <span>Température</span>
        <form-temperature v-model="props.temperature" :readonly="readonly"></form-temperature>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component, PropSync } from 'vue-property-decorator'
import { PhysicalProperties } from "../map/objects.model"
import FormDistance from "./distance.form.vue"
import FormMass from "./mass.form.vue"
import FormTemperature from "./temperature.form.vue"

@Component({
    components: { FormTemperature, FormDistance, FormMass }
})
export default class FormCelestrial extends Vue {
    @PropSync("value", PhysicalProperties) props!: PhysicalProperties;
    readonly = false
}
</script>