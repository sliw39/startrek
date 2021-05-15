<template>
  <section-component
    title="Plans de construction"
    color="yellow"
    :borders="4"
    :corners="7"
  >
    <section-component
      v-if="energyParts.length"
      title="Energie"
      color="blue"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in energyParts"
          :key="part.name"
          v-model="energyParts[i]"
          :draggable="true"
          @ondrag="$emit('itemdrag', part)"
        ></tile-component>
      </div>
    </section-component>
    <section-component
      v-if="defenseParts.length"
      title="Défense"
      color="red"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in defenseParts"
          :key="part.name"
          v-model="defenseParts[i]"
          :draggable="true"
          @ondrag="$emit('itemdrag', part)"
        ></tile-component>
      </div>
    </section-component>
    <section-component
      v-if="scienceParts.length"
      title="Sciences"
      color="yellow"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in scienceParts"
          :key="part.name"
          v-model="scienceParts[i]"
          :draggable="true"
          @ondrag="$emit('itemdrag', part)"
        ></tile-component>
      </div>
    </section-component>
    <section-component
      v-if="lifeParts.length"
      title="Habitat"
      color="green"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in lifeParts"
          :key="part.name"
          v-model="lifeParts[i]"
          :draggable="true"
          @ondrag="$emit('itemdrag', part)"
        ></tile-component>
      </div>
    </section-component>
    <section-component
      v-if="commandParts.length"
      title="Commandement"
      color="purple"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in commandParts"
          :key="part.name"
          v-model="commandParts[i]"
          :draggable="true"
          @ondrag="$emit('itemdrag', part)"
        ></tile-component>
      </div>
    </section-component>
    <section-component
      v-if="engParts.length"
      title="Ingénierie"
      color="yellow"
      :corners="0"
    >
      <div class="lib-tile-wrapper">
        <tile-component
          v-for="(part, i) in engParts"
          :key="part.name"
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
  justify-content: flex-start;
  font-size: 0.27rem;

  .hexagon {
    margin: 1em 4em 1em 4em;
  }
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { O } from "./hexagon";
import {
  CommandPart,
  DefensePart,
  EnergyPart,
  EngineeringPart,
  LifePart,
  Part,
  SciencePart,
} from "./vessel";
import { BEHAVIORS } from "./behaviors";
import { PartLibrary } from "./vessel-library.service";
import SectionComponent from "../framework/section-component.vue";
import TileComponent from "./tile-component.vue";

@Component({
  components: { SectionComponent, TileComponent },
})
export default class LibraryComponent extends Vue {
  parts: Part[] = [];

  async created() {
    this.parts = (await PartLibrary.loadAll()).map((p) =>
      PartLibrary.parsePart(p)
    );
  }

  get energyParts() {
    return this.parts.filter((p) => p instanceof EnergyPart);
  }

  get defenseParts() {
    return this.parts.filter((p) => p instanceof DefensePart);
  }

  get lifeParts() {
    return this.parts.filter((p) => p instanceof LifePart);
  }

  get commandParts() {
    return this.parts.filter((p) => p instanceof CommandPart);
  }

  get engParts() {
    return this.parts.filter((p) => p instanceof EngineeringPart);
  }

  get scienceParts() {
    return this.parts.filter((p) => p instanceof SciencePart);
  }
}
</script>