<template>
  <div class="main">
    <div class="card">
    <template v-if="login">
      <template v-if="location == 'menu'">
        <div class="menu">
          <msg-list-component v-if="!msgId" @selected="msgId = $event" :login="login"></msg-list-component>
          <msg-component v-if="msgId" v-bind:msg-id="msgId" @exit="msgId = null"></msg-component>
        </div>
        <div class="bottom-actions">
          <button class="item black-color green corn-bl corn-tl" v-if="!msgId" @click="location = 'newMsg'">Créer message</button>
          <button class="item black-color red corn-br corn-tr" v-if="!msgId" @click="login = null">Déconnexion</button>
        </div>
      </template>
      <template v-if="location == 'newMsg'">
        <msg-create-component @exit="location = 'menu'"></msg-create-component>
      </template> 
    </template>
    <login-component v-if="!login" @login="login = $event"></login-component>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop} from "vue-property-decorator";
import MsgCreateComponent from "../messages/msg-create-component.vue";
import MsgListComponent from "../messages/msg-list-component.vue"
import MsgComponent from "../messages/msg-component.vue"
import LoginComponent from "./login-component.vue";

@Component({
  components: {
    MsgCreateComponent,
    MsgListComponent,
    MsgComponent,
    LoginComponent
  }
})
export default class MainComponent extends Vue {
  @Prop(String) readonly propMessage: String | undefined;
  msgId: String | null = null;
  login: String | null = null;
  location = "menu";
}
</script>

<style lang="less">
.main {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center; 
  min-height: 100%;

  .card {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    max-width: 500px;
    min-height: 100%;
    position: relative;

    .menu {
      flex: 1;
      margin-bottom: 50px;
    }
    .bottom-actions {
      display: flex;
      flex-flow: row nowrap;
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
      justify-content: flex-end;
      
      > * {
        margin: 0 10px;
        width: 135px;
        text-align: center;
      }
    }
  }
}
</style>