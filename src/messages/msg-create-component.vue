<template>
  <div class="msg-create">
    <div class="row">
      <label for="from">De : </label>
      <input name="from" v-model="from" />
    </div>
    <div class="row">
      <label for="to">A : </label>
      <input name="to" v-model="to" @focus="toFocus = true" />
    </div>
    <div v-if="toFocus" class="recipients">
      <button
        class="item blue"
        @click="addRecipient(r)"
        v-for="r in recipients"
        v-bind:key="r"
      >
        {{ r }}
      </button>
    </div>

    <div class="row">
      <label>Importance : </label>
      <select v-model="level">
        <option value="1">Haute</option>
        <option value="2">Moyenne</option>
        <option value="3">Basse</option>
      </select>
    </div>
    <br />

    <textarea name="content" v-model="content"></textarea>

    <div class="checkbox">
      <input type="checkbox" name="sendNow" v-model="sendNow" />envoie immédiat
    </div>
    <div class="row" style="flex-direction: row-reverse">
      <button
        class="item black-color green corn-br corn-tr"
        @click="validate()"
      >
        Envoyer
      </button>
      <button
        class="item black-color blue corn-bl corn-tl"
        @click="$emit('exit')"
      >
        Retour
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { db } from "../db";

@Component
export default class MsgCreateComponent extends Vue {
  from = "";
  to = "";
  content = "";
  level = 1;
  sendNow = true;
  recipients: string[] = [];

  toFocus = false;

  mounted() {
    db.collection("users")
      .get()
      .then((snap) => {
        for (let doc of snap.docs) {
          this.recipients.push(doc.data().login);
        }
      });
  }

  addRecipient(r: string) {
    this.to = this.to ? this.to + "," + r : r;
    this.recipients.splice(this.recipients.indexOf(r), 1);
  }

  validate() {
    db.collection("messages")
      .add({
        from: this.from,
        to: this.to.split(","),
        level: this.level,
        content: this.content,
        status: this.sendNow ? "SENT" : "WAIT",
      })
      .then(() => this.$emit("exit"));
  }
}
</script>

<style lang="less">
.msg-create {
  textarea {
    width: 100%;
    height: 200px;
  }

  .row {
    label {
      flex: 1;
      align-self: center;
    }
    input,
    select {
      flex: 5;
    }
  }

  .checkbox {
    display: flex;
    align-items: center;
  }

  .recipients {
    display: flex;
    margin-bottom: 10px;

    > button:first-of-type {
      border-bottom-left-radius: 18px;
    }

    button {
      min-width: 0 !important;
      flex: 1;
    }

    > button:last-of-type {
      border-bottom-right-radius: 28px;
    }
  }
}
</style>