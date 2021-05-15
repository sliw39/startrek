import { Vue } from "vue-property-decorator";
export default class LoginComponent extends Vue {
  login: string;
  error: string;
  working: boolean;
  validate(): void;
}
