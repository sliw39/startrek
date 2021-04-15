<template>
<div>
    <div class="form-vessel-create form">
        <div class="row">
            <span>Faction</span>
            <select-img-component v-model="vessel.faction" :options="optionsImg()"></select-img-component>
        </div>
        <div class="row">
            <span>Classe</span>
            <input v-model="vessel.class">
        </div>
        <div class="row">
            <span>Désignation</span>
            <input v-model="vessel.designation">
        </div>
        <div class="row">
            <span>Nom</span>
            <input v-model="vessel.name">
        </div>
    </div>
    <div style="display: flex;">
        <button-component @click="create" color="green">Créer</button-component>
    </div>
</div>
</template>

<style lang="less">
.form-vessel-create {

    .select-img-option {
        backdrop-filter: invert(1);
    }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Emit } from "vue-property-decorator";
import { VesselDesc } from "./vessel";
import { LOGO } from "../diplomacy/factions"
import _ from "lodash";

@Component
export default class VesselAddComponent extends Vue {
    vessel: VesselDesc = {
        designation: "",
        class: "",
        faction: "",
        name: ""
    };

    optionsImg() {
        return _.keys(LOGO).map(key => {
            return { key, url: LOGO[key] }
        })
    }

    @Emit("created")
    create() {
        for(let key in this.vessel) {
            if(key !== "name" && !this.vessel[key as keyof VesselDesc]) {
                throw "Unsatified required attribute " + key
            }
        }
        return this.vessel;
    }
}

</script>
