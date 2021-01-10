<template>
<div class="mainframe">
    <section-component class="menu" title="Menu" color="yellow">
        <button-component :corners="6" @click="category = 'Messages'" :color="category === 'Messages' ? 'red': 'yellow'">Messages</button-component>
        <button-component :corners="6" @click="category = 'Carte'" :color="category === 'Carte' ? 'red': 'yellow'">Carte</button-component>
    </section-component>
    <section-component class="content" :title="category" color="yellow">
        <map-component v-if="category === 'Carte'"></map-component>
        <main-msg-component v-if="category === 'Messages'"></main-msg-component>
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
import MapComponent from "../map/map-component.vue";
import MainMsgComponent from "../messages/main-msg-component.vue";

@Component({
    components: { MapComponent, MainMsgComponent }
})
export default class MainframeComponent extends Vue {
    category = 'Carte'
}
</script>