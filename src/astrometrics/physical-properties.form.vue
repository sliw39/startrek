<template>
<div>
    <div class="row">
        <span>Rayon</span>
        <form-phy-qty v-model="props.radius" :readonly="readonly"></form-phy-qty>
    </div>
    <div class="row">
        <span>Masse</span>
        <form-phy-qty v-model="props.mass" :readonly="readonly"></form-phy-qty>
    </div>
    <div class="row">
        <span>Température</span>
        <form-phy-qty v-model="props.temperature" :readonly="readonly"></form-phy-qty>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, PropSync } from 'vue-property-decorator'
import { PhysicalProperties } from "../map/objects.model"
import FormPhyQty from "./physical-quantity.form.vue";

@Component({
    components: { FormPhyQty }
})
export default class FormCelestial extends Vue {
    @PropSync("value", PhysicalProperties) props!: PhysicalProperties;
    readonly = false
}
</script>