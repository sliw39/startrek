<template>
  <div class="msg-create">
    <div v-if="!loaded">Loading...</div>
    <template v-if="loaded">
      <div class="row">
        <span>De :</span>
        <span>{{ from }}</span>
      </div>
      <div class="row">
        <span>A :</span>
        <span v-for="dest in to" v-bind:key="dest"> {{ dest }} </span>
      </div>
      <hr />
      <div class="row">
        <div v-html="compiledMarkdown"></div>
      </div>
    </template>

    <div class="actions">
      <button
        class="item black-color red corn-br corn-tr"
        @click="del()"
        v-if="loaded"
      >
        Supprimer
      </button>
      <button class="item black-color blue corn-bl corn-tl" @click="cancel()">
        Retour
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { db } from "../db";
import marked from "marked";

@Component
export default class MsgComponent extends Vue {
  @Prop({ type: String, required: true }) readonly msgId: string | undefined;

  from = "";
  to = [];
  content = "";
  sendNow = false;
  loaded = false;

  get compiledMarkdown() {
    return marked(this.content);
  }

  mounted() {
    db.collection("messages")
      .doc(this.msgId)
      .get()
      .then((snap) => {
        const doc = snap.data();
        this.loaded = true;
        if (doc) {
          this.from = doc.from;
          this.to = doc.to;
          this.content = doc.content;
        }
      });
  }

  del() {
    db.collection("messages")
      .doc(this.msgId)
      .delete()
      .then((x) => this.cancel());
  }
  cancel() {
    this.$emit("exit");
  }
}
</script>

<style lang="less">
.actions {
  display: flex;
  flex-flow: row-reverse nowrap;
}
</style>