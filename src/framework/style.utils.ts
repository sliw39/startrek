export function parseCorner(style: number) {
    let digits = (style + "");
    let classes = {
        "corn-br": false,
        "corn-tr": false,
        "corn-tl": false,
        "corn-bl": false
    }

    function applyClass(c: typeof classes, digit: string) {
        switch (digit) {
            case "0":
                c["corn-br"] = false;
                c["corn-tr"] = false;
                c["corn-tl"] = false;
                c["corn-bl"] = false;
                break;
            case "1":
                c["corn-bl"] = true;
                break;
            case "2":
                applyClass(c, "1");
                applyClass(c, "3");
                break;
            case "3":
                c["corn-br"] = true;
                break;
            case "4":
                applyClass(c, "1");
                applyClass(c, "7");
                break;
            case "5":
                applyClass(c, "1");
                applyClass(c, "3");
                applyClass(c, "7");
                applyClass(c, "9");
                break;
            case "6":
                applyClass(c, "3");
                applyClass(c, "9");
                break;
            case "7":
                c["corn-tl"] = true;
                break;
            case "8":
                applyClass(c, "7");
                applyClass(c, "9");
                break;
            case "9":
                c["corn-tr"] = true;
                break;
        }
    }
    for(let digit of digits) {
        applyClass(classes, digit);
    }
    return classes;
}

const BorderWidth = "1px";
export function parseBorder(style: number) {
    let digits = (style + "");
    let styles = {
        borderStyle: "solid"
    } as CSSStyleDeclaration

    function apply(c: CSSStyleDeclaration, digit: string) {
        switch (digit) {
            case "0":
                c.border = `0`;
                break;
            case "1":
                c.borderWidth = `0 0 ${BorderWidth} ${BorderWidth}`;
                break;
            case "2":
                c.borderBottomWidth = `${BorderWidth}`;
                break;
            case "3":
                c.borderWidth = `0 ${BorderWidth} ${BorderWidth} 0`;
                break;
            case "4":
                c.borderLeftWidth = `${BorderWidth}`;
                break;
            case "5":
                c.borderWidth = `${BorderWidth}`;
                break;
            case "6":
                c.borderRightWidth = `${BorderWidth}`;
                break;
            case "7":
                c.borderWidth = `${BorderWidth} 0 0 ${BorderWidth}`;
                break;
            case "8":
                c.borderTopWidth = `${BorderWidth}`;
                break;
            case "9":
                c.borderWidth = `${BorderWidth} ${BorderWidth} 0 0`;
                break;
        }
    }
    for(let digit of digits) {
        apply(styles, digit);
    }
    return styles;
}