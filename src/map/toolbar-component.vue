<template>
  <div class="toolbar">
    <button @click="zoomIn">+</button>
    <button @click="zoomOut">-</button>

    <div class="nav-bg-outer">
      <div class="nav-bg-inner"></div>
      <div class="up" @click="move('up')">o</div>
      <div class="left" @click="move('left')">o</div>
      <div class="right" @click="move('right')">o</div>
      <div class="down" @click="move('down')">o</div>
    </div>

    <search-form @value="findCelestial"></search-form>
  </div>
</template>

<style lang="less">
.toolbar {
  display: flex;
  flex-flow: row nowrap;

  > button {
    width: 25px;
    height: 25px;
    color: black;
  }

  .nav-bg-outer {
    height: 100px;
    width: 100px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #333;
    border-radius: 50px;

    .nav-bg-inner {
      background-color: black;
      border-radius: 30px;
    }

    .up,
    .left,
    .right,
    .down {
      position: absolute;
      color: #eee;
      cursor: pointer;
    }
    .up {
      top: 0;
      text-align: center;
      width: 100%;
    }
    .left {
      top: 40px;
      left: 8px;
      width: 10px;
    }
    .right {
      top: 40px;
      right: 5px;
      width: 10px;
    }
    .down {
      bottom: 0;
      text-align: center;
      width: 100%;
    }
  }
}
</style>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { CelestialObject, System } from "./objects.model";
import map from "./map.module";
import { CelestialIo, SystemIo } from "../astrometrics/astrometrics.service";
import SearchForm from "../astrometrics/search.form.vue";

@Component({
  components: { SearchForm },
})
export default class ToolbarComponent extends Vue {
  zoomIn() {
    map.zoomIn();
  }

  zoomOut() {
    map.zoomOut();
  }

  move(dir: "up" | "down" | "left" | "right") {
    map.move({ dir, amount: 15 });
  }

  async findCelestial(uid: string) {
    let sys = await SystemIo.get(uid);
    if (sys) {
      map.selectSystem(sys);
    } else {
      let cel = await CelestialIo.get(uid);
      if (cel) {
        sys = await CelestialIo.getSystem(cel);
        if (sys) {
          map.selectSystem(sys);
        }
      }
    }
  }
}
</script>

