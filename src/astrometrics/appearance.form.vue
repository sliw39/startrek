<template>
    <div class="orbital-properties">
        <div class="row">
            <span>Luminosité</span>
            <span v-if="readonly">{{props.brightness}}</span>
            <input v-else type="number" step=".1" v-model="props.excentricity">
        </div>
        <select-img-component v-model="props.oclass" :options="opts"></select-img-component>
    </div>
</template>

<style lang="less">

</style>

<script lang="ts">
import Vue from 'vue'
import { Ref, Component, Prop, Emit, PropSync } from 'vue-property-decorator'
import { Appearance } from '../map/objects.model';

@Component
export default class FormAppearance extends Vue {
    @PropSync("value", Appearance) props!: Appearance;
    readonly = false;

    get opts() {
        return [
            {key: "O", url: "/static/star/o.png"},
            {key: "B", url: "/static/star/b.png"},
            {key: "A", url: "/static/star/a.png"},
            {key: "F", url: "/static/star/f.png"},
            {key: "G", url: "/static/star/g.png"},
            {key: "K", url: "/static/star/k.png"},
            {key: "M", url: "/static/star/m.png"},
        ]
    }
}
</script>