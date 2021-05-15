<template>
  <div class="login">
    <img src="static/stbadge.png" />
    <div class="error" v-if="error">{{ error }}</div>
    <input
      type="password"
      v-model="login"
      name="login"
      @keypress.enter="validate()"
    />
    <button
      class="item black-color green corn-br corn-bl corn-tr corn-tl"
      @click="validate()"
    >
      Connexion
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { db } from "../db";

@Component
export default class LoginComponent extends Vue {
  login = "";
  error = "";
  working = false;

  validate() {
    this.working = true;
    db.collection("users")
      .where("login", "==", this.login)
      .get()
      .then((snap) => {
        this.working = false;
        this.error = "";
        if (snap.size) {
          this.$emit("login", this.login);
        } else {
          this.error = "Accès refusé.";
        }
      });
  }
}
</script>

<style lang="less">
.login {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  img {
    margin-bottom: 20px;
  }

  input {
    text-align: center;
    color: black;
  }
}
</style>