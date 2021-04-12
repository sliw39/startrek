<template>
    <section-component title="Plans de construction" color="yellow" :borders="4" :corners="7">
        <section-component v-if="energyParts.length" title="Energie" color="blue" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in energyParts" :key="part.name"
                    v-model="energyParts[i]"
                    :draggable="true"              
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
        <section-component v-if="defenseParts.length" title="Défense" color="red" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in defenseParts" :key="part.name"
                    v-model="defenseParts[i]"
                    :draggable="true" 
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
        <section-component v-if="scienceParts.length" title="Sciences" color="yellow" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in scienceParts" :key="part.name"
                    v-model="scienceParts[i]"
                    :draggable="true" 
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
        <section-component v-if="lifeParts.length" title="Habitat" color="green" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in lifeParts" :key="part.name"
                    v-model="lifeParts[i]"
                    :draggable="true" 
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
        <section-component v-if="commandParts.length" title="Commandement" color="purple" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in commandParts" :key="part.name"
                    v-model="commandParts[i]"
                    :draggable="true" 
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
        <section-component v-if="engParts.length" title="Ingénierie" color="yellow" :corners="0">
            <div class="lib-tile-wrapper">
                <tile-component 
                    v-for="(part, i) in engParts" :key="part.name"
                    v-model="engParts[i]"
                    :draggable="true" 
                    @ondrag="$emit('itemdrag', part)"
                ></tile-component>
            </div>
        </section-component>
    </section-component>
</template>

<style lang="less">
.lib-tile-wrapper {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    font-size: .4rem;
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SectionComponent from "../framework/section-component.vue";
import TileComponent from "./tile-component.vue";
import { O } from "./hexagon";
import { DefensePart, EnergyPart, Part } from "./vessel";
import { BEHAVIORS } from "./behaviors";

@Component({
    components: { SectionComponent, TileComponent }
})
export default class LibraryComponent extends Vue {
    parts: Part[] = [
        new EnergyPart(O, "matrice de dilithium", 6, [BEHAVIORS['energy-depleted']]),
        new EnergyPart(O, "générateur à fusion", 3, [BEHAVIORS['energy-depleted']]),
        new EnergyPart(O, "batterie auxiliaire", 5),
        new EnergyPart(O, "circuit EPS", 1, [BEHAVIORS['on-destroy-kill-damage-neightbors']]),

        new DefensePart(O, "canon plasma", 1),
        new DefensePart(O, "phaseur", 2),
        new DefensePart(O, "torpilles à photons", 3),
        new DefensePart(O, "déflecteur", 6),
    ]
    
    get energyParts() {
        return this.parts.filter(p => p instanceof EnergyPart);
    }

    get defenseParts() {
        return this.parts.filter(p => p instanceof DefensePart);
    }

    get lifeParts() {
        return [];
    }

    get commandParts() {
        return [];
    }

    get engParts() {
        return [];
    }

    get scienceParts() {
        return [];
    }
}
</script>