import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Coordinate, System } from './objects.model';
import { store } from "../store.vuex"
import { Vector } from '../framework/geometry';

@Module({
  namespaced: true,
  name: 'map',
  store,
  dynamic: true,
})
class MapModule extends VuexModule {
  private _zoom = 1;
  private _selectedSystem: System | null = null;
  private _center: Coordinate = { x: 0, y: 0, unit: "al" };

  @Mutation
  setZoom(zoom: number) {
    this._zoom = zoom;
  }
  @Mutation
  zoomReset() {
    this._zoom = 1;
  }
  get zoom() {
    return this._zoom;
  }

  @Mutation
  selectSystem(system: System) {
    this._selectedSystem = system;
  }
  @Mutation
  deSelectSystem() {
    this._selectedSystem = null;
  }
  get selectedSystem() {
    return this._selectedSystem;
  }

  @Mutation
  setCenter(coordinate: Coordinate) {
    this._center = coordinate;
  }
  get center() {
    return this._center;
  }

  @Action
  zoomIn() {
    this.setZoom(this.zoom + 0.25);
  }
  @Action
  zoomOut() {
    if(this.zoom - 0.25 > 0) {
      this.setZoom(this.zoom - 0.25);
    }
  }

  @Action
  move(payload: {dir: "up"|"down"|"left"|"right", amount: number} | Vector) {
    if(payload instanceof Vector) {
      let point = payload.apply(this.center);
      this.setCenter({ x: point.x, y: point.y, unit: 'al' });
    } else {
      switch(payload.dir) {
        case "up":
          this.setCenter({ ...this.center, y: this.center.y - payload.amount });
          break;
        case "down":
          this.setCenter({ ...this.center, y: this.center.y + payload.amount });
          break;
        case "left":
          this.setCenter({ ...this.center, x: this.center.x - payload.amount });
          break;
        case "right":
          this.setCenter({ ...this.center, x: this.center.x + payload.amount });
          break;
      }
    }
  }

  

}

export default getModule(MapModule);