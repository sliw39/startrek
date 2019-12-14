import Vue from "vue";
import { firestorePlugin } from "vuefire";
import MainComponent from "./main/main-component.vue";

Vue.use(firestorePlugin);

new Vue({
    el: document.getElementById("main") || undefined,
    components: { MainComponent },
    template: "<main-component propMessage='coucou' />"
});