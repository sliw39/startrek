<template>
<div class="viewport" ref="viewport" @mousemove="updateLabel">
  <star-component
      v-for="s in systems"
      :key="s.s.names[0]"
      :x="s.x"
      :y="s.y"
      :system="s.s"
      :selected="s.s === selectedElement"
      @clicked="select(s.s)">
  </star-component>
  <div class="indicator" v-if="selectedElement && distance && labelPos">
    <div>distance : {{distance.al.toFixed(1)}} al</div>
    <div v-for="i in [1,2,3,4,5,6,7,8,9]" :key="i">warp {{i}} : {{timeStr(distance, i)}}</div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { System, Distance } from "./objects.model";
import StarComponent from "./star-component.vue";
import { timeStr } from "./navigation.service"

@Component({
  components: { StarComponent }
})
export default class ViewportComponent extends Vue {

  @Prop({ type: Number, default:1.0}) zoom!: number;

  selectedElement: System | null = null;
  distance: Distance | null = null;
  labelPos: {x: number, y: number} | null = null;
  allSystems = [
    new System(["Sol", "Terre"], {x:0, y:0, unit:"al"}, []), 
    new System(["Procyon", "Andoria"], {x:6.75, y:9.75, unit:"al"}, []),
    new System(["40 Eridani", "Vulcain"], {x:4.6875, y:12.375, unit:"al"}, []),
    new System(["Denobula"], {x:30.75, y:5.625, unit:"al"}, []),
    new System(["Lych"], {x:25.1, y:4.2, unit:"al"}, [])
  ]

  get systems() {
    const w = (this.$refs?.viewport as HTMLElement)?.offsetWidth || 900;
    const h = (this.$refs?.viewport as HTMLElement)?.offsetHeight || 900;

    let res = [];
    for(let s of this.allSystems) {
      res.push({
        x: w/2 + w*s.coordinate.x/(120/this.zoom),
        y: h/2 + h*s.coordinate.y/(120/this.zoom),
        s
      })
    }
    return res;
  }

  @Emit("selected")
  select(system: System) {
    this.selectedElement = system;
    return system;
  }

  timeStr = timeStr;

  updateLabel($event: MouseEvent) {
    if(this.selectedElement == null) {
      return;
    }

    const w = (this.$refs?.viewport as HTMLElement)?.offsetWidth || 900;
    const h = (this.$refs?.viewport as HTMLElement)?.offsetHeight || 900;
    let x = (120/this.zoom) * ($event.x - w/2) / w
    let y = (120/this.zoom) * ($event.y - h/2) / h
    this.distance = Distance.fromCoordinates({x,y,unit:"al"}, this.selectedElement.coordinate);
    this.labelPos = {
      x: $event.x + 10,
      y: $event.y - 10
    }
  }
}
</script>

<style lang="less">
.viewport {
  height: 900px;
  width: 900px;
  position: relative;

  .indicator {
    position: absolute;
    color: red;
    font-size: 10px;
    display: flex;
    flex-direction: column;
  }
}
</style>