<template>
<div class="viewport"
  ref="viewport" 
  @mousedown="initDrag"
  @mouseup="stopDrag"
  @mouseleave="stopDrag"
  @mousemove="onMouseMove" 
  @mousewheel.prevent="onZoomChange">
  <star-component
      v-for="s in systems"
      :key="s.s.names[0]"
      :x="s.x"
      :y="s.y"
      :system="s.s"
      :selected="s.s === selectedElement"
      @clicked="select(s.s)">
  </star-component>
  <div class="indicator" v-if="selectedElement && distance && labelPos" :style="{top: labelPos.y+'px', left: labelPos.x+'px'}">
    <div>distance : {{distance.al.toFixed(1)}} al</div>
    <div v-for="i in [1,2,3,4,5,6,7,8,9]" :key="i">warp {{i}} : {{timeStr(distance, i)}}</div>
  </div>
  <template v-for="pos in grid">  
    <div class="hbars" :key="'h'+pos.y" :style="{top: pos.y + 'px'}"></div>
    <div class="vbars" :key="'v'+pos.x" :style="{left: pos.x + 'px'}"></div>
  </template>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Ref } from "vue-property-decorator";
import { System, Distance, Coordinate, Star, OrbitalProperties, Mass, Appearance, PhysicalProperties, Temperature, Time } from "./objects.model";
import StarComponent from "./star-component.vue";
import { timeStr } from "./navigation.service"
import { IPoint, Point, Rectangle, Segment, Vector } from "../framework/geometry";
import map from "./map.module";
import _ from "lodash";

const AL_PX = 10;

@Component({
  components: { StarComponent }
})
export default class ViewportComponent extends Vue {

  @Ref() viewport!: HTMLElement;

  distance: Distance | null = null;
  labelPos: {x: number, y: number} | null = null;
  allSystems = [
    new System(["Sol", "Terre"], {x:0, y:0, unit:"al"}, [
      new Star(
        ["Sun"], 
        undefined, 
        new Appearance(1, "G"))
    ]), 
    new System(["Procyon", "Andoria"], {x:6.75, y:9.75, unit:"al"}, [
      new Star(
        ["Procyon A"], 
        new PhysicalProperties(Distance.sunRadius(2.048), Mass.sun(1.42), Temperature.k(6550)),
        new Appearance(7.73, "A")),
      new Star(
        ["Procyon B"], 
        new PhysicalProperties(Distance.sunRadius(.02), Mass.sun(.6), Temperature.k(9700)),
        new Appearance(.00055, "A"),
        new OrbitalProperties(new Distance(14, "ua"), 0.407, new Time(40.82, "y"), 31.1))
    ]),
    new System(["40 Eridani", "Vulcain"], {x:4.6875, y:12.375, unit:"al"}, [
      new Star(
        ["40 Eridani A"], 
        new PhysicalProperties(Distance.sunRadius(.81), Mass.sun(.84), Temperature.k(5200)),
        new Appearance(.4, "G")),
      new Star(
        ["40 Eridani B"], 
        new PhysicalProperties(Distance.sunRadius(.014), Mass.sun(.5), Temperature.k(16500)),
        new Appearance(.013, "B")),
      new Star(
        ["40 Eridani C"], 
        new PhysicalProperties(Distance.sunRadius(.31), Mass.sun(.2), Temperature.k(3100)),
        new Appearance(.008, "M")),
    ]),
    new System(["Denobula"], {x:30.75, y:5.625, unit:"al"}, [
      new Star(
        ["Denobula Triaxa"], 
        new PhysicalProperties(Distance.sunRadius(35), Mass.sun(150), Temperature.k(3100)),
        new Appearance(4, "M")),
    ]),
    new System(["Lych"], {x:25.1, y:4.2, unit:"al"}, [
      new Star(
        ["PSR B1257+12"], 
        new PhysicalProperties(new Distance(10, "km"), Mass.sun(1.4), Temperature.k(28856)),
        new Appearance(5.2, "G")),
    ])
  ];
  
  mounted() {
    console.log(JSON.stringify(this.allSystems));
  }

  get bounds() {
    const w = this.viewport?.offsetWidth;
    const h = this.viewport?.offsetHeight;

    return Rectangle.fromCenter(map.center, w, h).scaled(1/this.alLength);
  }

  get systems() {
    let res = []
    for(let s of this.allSystems) {
      if(this.bounds.include(s.coordinate)) {
        let point = this.coordinatesToViewportLocation(s.coordinate);
        res.push({
          x: point.x,
          y: point.y,
          s
        })
      }
    }
    return res;
  }

  get grid() {
    const STEP = 15;
    let count = Math.ceil(Math.max(this.bounds.witdh, this.bounds.height) / STEP)
    let x = this.bounds.x0 - this.bounds.x0%15;
    let y = this.bounds.y0 - this.bounds.y0%15;
    let res = [this.coordinatesToViewportLocation({x,y})];
    for(let i=0; i<count; i++) {
      x += STEP; 
      y += STEP;
      res.push(this.coordinatesToViewportLocation({x,y}));
    }
    return res;
  }

  get alLength() {
    return AL_PX*map.zoom;
  }

  get selectedElement() {
    return map.selectedSystem;
  }

  get viewportCenter() {
    const w = this.viewport?.offsetWidth || 900;
    const h = this.viewport?.offsetHeight || 900;
    return new Point(w/2, h/2);
  }

  select(system: System) {
    map.selectSystem(system);
    return system;
  }

  timeStr = timeStr;
  dragStartPosition: Point | null = null;
  oldCenterMemo: Coordinate | null = null;
  initDrag($event: MouseEvent) {
    this.dragStartPosition = new Point($event.clientX, $event.clientY);
    this.oldCenterMemo = {...map.center}
  }
  stopDrag($event: MouseEvent) {
    this.dragStartPosition = null;
  }
  onMouseMove($event: MouseEvent) {
    let pos = new Point($event.clientX, $event.clientY);
    if(this.dragStartPosition && this.oldCenterMemo) {
      let seg = new Segment(this.dragStartPosition, pos);
      if(seg.length > 10) {
        this.moveMap(seg, this.oldCenterMemo);
      }
    }

    this.updateLabel($event);
  }
  moveMap = _.throttle((seg: Segment, center: Coordinate) => {
    map.deSelectSystem();
    let newPoint = seg.toVector().scaled(1/this.alLength).reversed().apply(center);
    map.setCenter({x: newPoint.x, y: newPoint.y, unit: "al"});
    return;
  }, 40);
  updateLabel($event: MouseEvent) {
    if(map.selectedSystem === null || !$event.target) {
      return;
    }

    var bounds = ($event.currentTarget as HTMLElement).getBoundingClientRect();
    var x = $event.clientX - bounds.left;
    var y = $event.clientY - bounds.top;

    let target = this.coordinatesToViewportLocation(map.selectedSystem.coordinate);
    this.distance = new Distance(new Segment(target, {x,y}).length / this.alLength, "al");

    this.labelPos = {x: x+15,y}
  }

  vectorToOrigin() {
    const w = this.viewport?.offsetWidth;
    const h = this.viewport?.offsetHeight;
    return Vector.pointToOrigin(map.center).add(Vector.originToPoint(this.viewportCenter));
  }

  coordinatesToViewportLocation(coordinates: IPoint) {
    let point = coordinates instanceof Point ? coordinates : Point.fromObject(coordinates);
    point = point.translated(this.vectorToOrigin());
    point = Vector.betweenPoints(this.viewportCenter, point).scaled(this.alLength).apply(point);

    return point;
  }

  onZoomChange($event: WheelEvent) {
    if($event.deltaY > 0) {
      map.zoomIn();
    } else {
      map.zoomOut();
    }
  }
}
</script>

<style lang="less">
.viewport {
  height: 100%;
  width: 100%;
  position: relative;
  background-image: url(/static/bgmap.png);
  overflow: hidden;

  .star {
    z-index: 1;
  }

  .indicator {
    position: absolute;
    color: red;
    font-size: 10px;
    display: flex;
    flex-direction: column;
    background-color: #333;
    user-select: none;
    z-index: 2;
  }

  .hbars {
    position: absolute;
    left: 0;
    right: 0;
    border-bottom: 1px solid #333;
  }

  .vbars {
    position: absolute;
    top: 0;
    bottom: 0;
    border-right: 1px solid #333;
  }
}
</style>