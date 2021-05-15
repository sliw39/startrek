import { Vue } from "vue-property-decorator";
export default class MsgComponent extends Vue {
  readonly msgId: string | undefined;
  from: string;
  to: never[];
  content: string;
  sendNow: boolean;
  loaded: boolean;
  readonly compiledMarkdown: string;
  mounted(): void;
  del(): void;
  cancel(): void;
}
