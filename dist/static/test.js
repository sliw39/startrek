var RADIUS = 400;
var RADIUSRATIO = 0.85;
var PADDING = 20;
var SLICES = 8;
var FONT_SIZE = 26;

var MIDRATIO = (1 - ((1-RADIUSRATIO) / 2)*1.3);

var choices = ["INFORMATIQUE : ", "LANGUES : ", "PHYSIQUE : ", "MEDECINE : ", "PILOTAGE : ", "INGENIERIE : ", "DEFENSE : ", "RESISTANCE : "]
var colors =  ["#397FC0",         "#397FC0",    "#39C05E",     "#39C05E",     "#9739C0",     "#9739C0",       "#D34B30",    "#D34B30"      ]

var svg = "";
for (var i = 0; i < SLICES; i++) {
    var p1 = {
        x: Math.cos(Math.PI * 2 / SLICES * i) * RADIUS + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * i) * RADIUS + RADIUS + PADDING
    };
    var p2 = {
        x: Math.cos(Math.PI * 2 / SLICES * (i + 1)) * RADIUS + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * (i + 1)) * RADIUS + RADIUS + PADDING
    };
    var p4 = {
        x: Math.cos(Math.PI * 2 / SLICES * i) * (RADIUS * RADIUSRATIO) + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * i) * (RADIUS * RADIUSRATIO) + RADIUS + PADDING
    };
    var p3 = {
        x: Math.cos(Math.PI * 2 / SLICES * (i + 1)) * (RADIUS * RADIUSRATIO) + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * (i + 1)) * (RADIUS * RADIUSRATIO) + RADIUS + PADDING
    };

    var decay = i < 4 ? FONT_SIZE-4 : 0;
    var t1 = {
        x: Math.cos(Math.PI * 2 / SLICES * i) * ((RADIUS + decay) * MIDRATIO) + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * i) * ((RADIUS + decay) * MIDRATIO) + RADIUS + PADDING
    };
    var t2 = {
        x: Math.cos(Math.PI * 2 / SLICES * (i + 1)) * ((RADIUS + decay) * MIDRATIO) + RADIUS + PADDING,
        y: Math.sin(Math.PI * 2 / SLICES * (i + 1)) * ((RADIUS + decay) * MIDRATIO) + RADIUS + PADDING
    };
    // svg += "<path d='M "+(RADIUS+PADDING)+" "+(RADIUS+PADDING)+" L "+p3.x+" "+p3.y+" A "+(RADIUS/2)+" "+(RADIUS/2)+" 0 0 0 "+p4.x+" "+p4.y+" z' fill='green' stroke='white' onclick='alert(\"inner-"+i+"\")'/>";
    svg += "<path d='M " + p1.x + " " + p1.y + " A " + RADIUS + " " + RADIUS + " 0 0 1 " + p2.x + " " + p2.y + "  L " + p3.x + " " + p3.y + " A " + RADIUS * RADIUSRATIO + " " + RADIUS * RADIUSRATIO + " 0 0 0 " + p4.x + " " + p4.y + "  z' fill='transparent' stroke='black' onclick='alert(\"outer-" + i + "\")'></path>";
    if(i < 4) {
        svg += "<path id='path" + i + "' d=\"M " + t2.x + " " + t2.y + " A " + (RADIUS + decay) * MIDRATIO + " " + (RADIUS + decay) * MIDRATIO + " 0 0 0 " + t1.x + " " + t1.y + "\" fill='transparent' stroke='transparent' />";
    } else {
        svg += "<path id='path" + i + "' d=\"M " + t1.x + " " + t1.y + " A " + (RADIUS + decay) * MIDRATIO + " " + (RADIUS + decay) * MIDRATIO + " 0 0 1 " + t2.x + " " + t2.y + "\" fill='transparent' stroke='transparent' />";
    }
    svg += '<text>'+
       '<textPath href="#path'+i+'" startOffset="10%" font-family="Roddenberry" fill="'+colors[i]+'" font-size="'+FONT_SIZE+'px">'+
            choices[i] + 
       '</textPath>'+
     '</text>';
}
svg = "<svg height='" + (RADIUS * 2 + PADDING * 2) + "px' width='" + (RADIUS * 2 + PADDING * 2) + "px'>" + svg + "</svg>";
$("body").append(svg);
