import { Vue } from "vue-property-decorator";
export default class MainComponent extends Vue {
    readonly propMessage: String | undefined;
    msgId: String | null;
    login: String | null;
    location: string;
}
