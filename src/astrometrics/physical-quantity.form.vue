<template>
  <div class="form-psysical-quantity">
    <template v-if="readonly">
      <span>{{ value.get(selectedUnit) }}</span>
      <select-component
        :options="selectedAllowedOptions"
        v-model="selectedUnit"
      ></select-component>
    </template>
    <template v-else>
      <input type="number" v-model="selectedValue" @change="setValue" />
      <select-component
        :options="selectedAllowedOptions"
        :value="selectedUnit"
        @input="setUnit($event)"
      ></select-component>
    </template>
  </div>
</template>

<style lang="less">
.form-psysical-quantity {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  > * {
    margin-right: 10px;
  }
}
</style>

<script lang="ts">
import Vue from "vue";
import { Prop, Component, Emit, Watch } from "vue-property-decorator";
import { PhysicalQuantity } from "../map/objects.model";
import _ from "lodash";

@Component
export default class FormPhysicalQuantity extends Vue {
  @Prop(Object) value!: PhysicalQuantity<any>;
  @Prop({ type: Array, default: () => [] })
  allowedOptions!: string[];
  @Prop({ type: Boolean, default: false }) readonly!: boolean;

  selectedAllowedOptions: string[] = [];
  selectedValue: string = "0";
  selectedUnit = "d";

  mounted() {
    this.selectedAllowedOptions = this.value.allUnits();
    this.selectedUnit = this.value.unit;
    this.selectedValue = this.value.get(this.selectedUnit) + "";
  }

  @Watch("value")
  setTime(val: PhysicalQuantity<any>) {
    this.selectedAllowedOptions = val.allUnits();
    this.selectedUnit = val.unit;
    this.selectedValue = val.get() + "";
  }

  @Emit("input")
  setValue() {
    return this.value.newInstance(
      parseFloat(this.selectedValue),
      this.selectedUnit
    );
  }

  @Emit("input")
  setUnit(data: string) {
    let val = this.value.newInstance(
      parseFloat(this.selectedValue),
      this.selectedUnit
    );
    this.selectedUnit = data;
    this.selectedValue = val.get(data) + "";
    return this.value.newInstance(val.get(data), data);
  }
}
</script>