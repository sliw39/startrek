<template>
<div class="mainframe">
    <section-component class="menu" title="Menu" color="yellow">
        <button-component :corners="6" @click="category = 'Messages'" :color="category === 'Messages' ? 'red': 'yellow'">Messages</button-component>
        <button-component :corners="6" @click="category = 'Map'" :color="category === 'Map' ? 'red': 'yellow'">Carte</button-component>
        <button-component :corners="6" @click="category = 'Astrometric'" :color="category === 'Astrometric' ? 'red': 'yellow'">Astrométrie</button-component>
    </section-component>
    <section-component class="content" :title="category" color="yellow">
        <map-component v-if="category === 'Map'"></map-component>
        <main-msg-component v-if="category === 'Messages'"></main-msg-component>
        <form-system v-if="category === 'Astrometric'"></form-system>
    </section-component>
</div>
</template>

<style lang="less">
.mainframe {
    display: flex;
    flex-flow: row nowrap;
    height: 100%;

    > .menu {
        flex: 1;
    }

    > .content {
        flex: 5;
    }
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import FormSystem from "../astrometrics/system.form.vue";
import MapComponent from "../map/map-component.vue";
import MainMsgComponent from "../messages/main-msg-component.vue";

@Component({
    components: { MapComponent, MainMsgComponent, FormSystem }
})
export default class MainframeComponent extends Vue {
    category = 'Astrometric'
}
</script>