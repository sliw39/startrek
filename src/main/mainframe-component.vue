<template>
<div class="mainframe">
    <section-component class="menu" title="Menu" color="yellow">
        <router-link :to="route.path" custom v-slot="{isActive, navigate}" v-for="route in $router.getRoutes()" :key="route.name">
            <button-component :corners="6" @click="navigate" :color="isActive ? 'red': 'yellow'">{{route.name}}</button-component>
        </router-link>
    </section-component>
    <section-component class="content" :title="category" color="yellow">
        <router-view></router-view>
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
import { Component, Vue } from "vue-property-decorator";
import { Route } from "vue-router";

@Component({
    components: { }
})
export default class MainframeComponent extends Vue {
    category = ''
    mounted() {
        this.$router.afterEach((to: Route) => {
            if(to.name) {
                this.category = to.name
            }
        })
        this.category = this.$route.name || "";
    }
}
</script>