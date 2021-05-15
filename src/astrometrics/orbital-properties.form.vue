 <template>
  <div class="orbital-properties">
    <div class="row">
      <span>Demi-Axe Majeur</span>
      <form-phy-qty
        v-model="props.semiMajorAxis"
        :readonly="readonly"
      ></form-phy-qty>
    </div>
    <div class="row">
      <span>Période</span>
      <form-phy-qty v-model="props.period" :readonly="readonly"></form-phy-qty>
    </div>
    <div class="row">
      <span>Excentricité</span>
      <span v-if="readonly">{{ props.excentricity }}</span>
      <input
        v-else
        type="number"
        min="0"
        max="1"
        step=".1"
        v-model="props.excentricity"
      />
    </div>
    <div class="row">
      <span>Inclinaison</span>
      <span v-if="readonly">{{ props.tilt }}</span>
      <input
        v-else
        type="number"
        min="0"
        max="360"
        step="1"
        v-model="props.tilt"
      />
    </div>
  </div>
</template>

<style lang="less">
.row {
  > span:first-of-type {
    width: 200px;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, PropSync } from "vue-property-decorator";
import { OrbitalProperties } from "../map/objects.model";
import FormPhyQty from "./physical-quantity.form.vue";

@Component({
  components: { FormPhyQty },
})
export default class FormOrbitalProperties extends Vue {
  @PropSync("value", OrbitalProperties) props!: OrbitalProperties;
  readonly = false;
}
</script>