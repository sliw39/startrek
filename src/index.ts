import Vue from "vue";
import MainframeComponent from "./main/mainframe-component.vue"; 
import MapComponent from "./map/map-component.vue";
import AstrometricsComponent from "./astrometrics/astrometrics.form.vue";
import MessagesComponent from "./messages/main-msg-component.vue";
import VesselLibrary from "./vessel/vessel-library.component.vue";
import Vue2TouchEvents from 'vue2-touch-events'
import VueRouter from 'vue-router'
import { firestorePlugin } from "vuefire";
import { store } from "./store.vuex";

import "./framework/button-component.vue";
import "./framework/section-component.vue";
import "./framework/select-component.vue";
import "./framework/select-img-component.vue";
import "./framework/collapsible-component.vue";

import "./battle/battle-engine";


Vue.use(Vue2TouchEvents);
Vue.use(firestorePlugin);
Vue.use(VueRouter);

const routes = [
    { name: "Carte", path: "/map", component: MapComponent }, 
    { name: "Astrometrie", path: "/astrometrics/:uid", component: AstrometricsComponent }, 
    { name: "Messages", path: "/messages", component: MessagesComponent },
    { name: "Vaisseaux", path: "/vessels", component: VesselLibrary }]

const router = new VueRouter({
    routes
})

new Vue({
    el: document.getElementById("main") || undefined,
    components: { MainframeComponent },
    router,
    store, 
    template: `<mainframe-component/>`
});