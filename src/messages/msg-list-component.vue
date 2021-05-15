<template>
  <div class="msg-list">
    <button
      class="item corn-tr corn-br"
      :class="{
        red: msg.level == '1',
        orange: msg.level == '2',
        green: msg.level == '3',
      }"
      v-for="msg in messages"
      v-bind:key="msg.id"
      @click="$emit('selected', msg.id)"
    >
      {{ msg.id | subs }}
    </button>
  </div>
</template> 

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { db } from "../db";

@Component({
  filters: {
    subs: function (val: string) {
      return val.substring(0, 5);
    },
  },
})
export default class MsgListComponent extends Vue {
  @Prop(String) readonly login!: String;

  data() {
    return {
      messages: [],
    };
  }

  mounted() {
    this.$bind(
      "messages",
      db
        .collection("messages")
        .where("status", "==", "SENT")
        .where("to", "array-contains", this.login)
    );
    db.collection("messages")
      .where("status", "==", "SENT")
      .where("to", "array-contains", this.login)
      .onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            console.log("New message: ", change.doc.data());
            if (navigator.vibrate) {
              navigator.vibrate(1000);
            }
          }
          if (change.type === "modified") {
            console.log("Modified message: ", change.doc.data());
          }
          if (change.type === "removed") {
            console.log("Removed message: ", change.doc.data());
          }
        });
      });
  }
}
</script>

<style lang="less">
.msg-list {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-end;
}
</style>