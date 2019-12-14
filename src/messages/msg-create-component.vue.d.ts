import { Vue } from "vue-property-decorator";
export default class MsgCreateComponent extends Vue {
    from: string;
    to: string;
    content: string;
    level: number;
    sendNow: boolean;
    recipients: string[];
    toFocus: boolean;
    mounted(): void;
    addRecipient(r: string): void;
    validate(): void;
}
