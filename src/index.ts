import Vue from "vue";
import { firestorePlugin } from "vuefire";
import MapComponent from "./map/Map-component.vue";

Vue.use(firestorePlugin);

new Vue({
    el: document.getElementById("main") || undefined,
    components: { MapComponent },
    template: `<map-component/>`
});