
<template>
  <div>
    <battle-turn-component
      v-if="currentDamage"
      v-model="currentDamage.damage"
      @end="endDamage"
    ></battle-turn-component>
    <button-component v-if="nextTurn" @click="runNextTurn"
      >Tour Suivant</button-component
    >
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import BattleTurnComponent from "./battle-turn.component.vue";
import {
  Team,
  BattleManager,
  DumbAIExecutor,
  TurnEvent,
  AttackEvent,
  EndEvent,
} from "./battle-engine";
import { VesselLibrary } from "../vessel/vessel-library.service";
import { Vessel } from "../vessel/vessel";
import { foldHomonyms } from "../diplomacy/factions";

@Component({ components: { BattleTurnComponent } })
export default class BattleRunComponent extends Vue {
  private teams: Team[] = [];
  private engine = new BattleManager();

  private nextTurn: TurnEvent | null = null;
  private currentDamage: AttackEvent | null = null;

  async mounted() {
    this.teams.push(
      new Team("Team A", [
        {
          executor: new DumbAIExecutor(),
          vessel:
            (await VesselLibrary.loadClass({
              faction: foldHomonyms("romuliens"),
              class: "BW",
              designation: "1",
            })) ?? new Vessel(),
          crew: {
            pilot: { attribute: 2, skill: 15 },
            engineer: { attribute: 1, skill: 12 },
            tactical: { attribute: 3, skill: 8 },
          },
        },
      ]),
      new Team("Team B", [
        {
          executor: new DumbAIExecutor(),
          vessel:
            (await VesselLibrary.loadClass({
              faction: foldHomonyms("romuliens"),
              class: "BW",
              designation: "2",
            })) ?? new Vessel(),
          crew: {
            pilot: { attribute: 2, skill: 15 },
            engineer: { attribute: 1, skill: 12 },
            tactical: { attribute: 3, skill: 8 },
          },
        },
      ])
    );

    this.engine.event
      .on<TurnEvent>("turn", (evt) => {
        this.nextTurn = evt.data;
        this.$forceUpdate();
      })
      .on<AttackEvent>("attack", (evt) => {
        this.currentDamage = evt.data;
        this.$forceUpdate();
      })
      .on<EndEvent>("end", (evt) => evt.data.consume?.());

    this.engine
      .addTeam(this.teams[0])
      .addTeam(this.teams[1])
      .run((turn) => Promise.resolve(turn > 100));
  }

  runNextTurn() {
    this.nextTurn?.consume?.();
    this.nextTurn = null;
  }

  endDamage() {
    this.currentDamage?.consume?.();
    this.currentDamage = null;
  }
}
</script>