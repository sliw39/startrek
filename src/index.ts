import Vue from "vue";
import { firestorePlugin } from "vuefire";
import MainframeComponent from "./main/mainframe-component.vue"; 
import { store } from "./store.vuex";

import "./framework/button-component.vue";
import "./framework/section-component.vue";

Vue.use(firestorePlugin);

new Vue({
    el: document.getElementById("main") || undefined,
    components: { MainframeComponent },
    store, 
    template: `<mainframe-component/>`
});