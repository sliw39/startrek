<template>
    <div class="orbital-properties">
        <div class="row">
            <span>Luminosité</span>
            <span v-if="readonly">{{props.brightness}}</span>
            <input v-else type="number" step=".1" v-model.number="props.brightness">
        </div>
        <select-img-component v-model="props.oclass" :options="opts"></select-img-component>
    </div>
</template>

<style lang="less">

</style>

<script lang="ts">
import Vue from 'vue'
import { Component, PropSync } from 'vue-property-decorator'
import { Appearance } from '../map/objects.model';
import { StarsImg } from './astrometrics.utils'

@Component
export default class FormAppearance extends Vue {
    @PropSync("value", Appearance) props!: Appearance;
    readonly = false;

    get opts() {
        return StarsImg;
    }
}
</script>