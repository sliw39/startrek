<template>
<div>
    <span>{{obj.names[0]}}</span>
    <form-orbital-properties v-model="obj.orbital"></form-orbital-properties>
    <form-appearance v-model="obj.appearance"></form-appearance>
    <form-physical-properties v-model="obj.physical"></form-physical-properties>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Component, PropSync } from 'vue-property-decorator'
import { CelestialObject } from '../map/objects.model'
import FormOrbitalProperties from "./orbital-properties.form.vue"
import FormAppearance from "./appearance.form.vue"
import FormPhysicalProperties from "./physical-properties.form.vue"

@Component({
    components: { FormOrbitalProperties, FormAppearance, FormPhysicalProperties }
})
export default class FormCelestrial extends Vue {
    @PropSync("value", CelestialObject) obj!: CelestialObject;
}
</script>