import { json } from "stream/consumers";
let results: any = [];
export function cleanResults() {
    results = [];
}

export function addResult(data: any, title: string, datasetNumber: number) {
    const markup = new Array(`<h2>${title}</h2>`);
    const headers = data.reduce((accumulator: any, item: any) => {
        const markup = { ...accumulator };
        for (var key in item) {
            if (!markup.hasOwnProperty(key)) {
                markup[key] = [];
            }
        }
        return markup;
    }, {});
    const tableData = data.reduce((accumulator: any, item: any) => {
        for (var key in accumulator) {
            accumulator[key].push(item[key]);
        }
        return accumulator;
    }, headers);
    //Rendering table
    if (!data || data.length < 1) {
        markup.push("<h3>No data Found<h3>");
    } else {
        markup.push("<table>");
        markup.push("<thead><tr>");
        markup.push("<td>#</td>");
        for (var key in tableData) {
            markup.push(`<td>${key}</td>`);
        };
        markup.push("</tr></thead><tbody>");
        for (var i = 0; i < data.length; i++) {
            markup.push("<tr>");
            markup.push(`<td class='fixed'><strong>${i + 1}</strong></td>`);
            for (var key in tableData) {
                markup.push(`<td>${getMarkupForCellContent(tableData[key][i], `${datasetNumber}-${key}-${i}`)}</td>`);
            };
            markup.push("<tr>");
        };
        markup.push("</tbody></table>");
    }
    results.push(markup.join(""));
}

export function addError(errorText:string, title: string){
    results.push(`<h2>${title}</h2><h3 style="color:red">Error:</h3><div>${errorText}</div>`);
}

export function buildHtmlDocument() {

    const result = CreateHtmlDocument(results.join("<hr/>"));    
    results = [];
    return result;
}

function getMarkupForCellContent(cellContent: any, key: any) {
    if (Array.isArray(cellContent)) {
        return `[..${cellContent.length}..]`;
    }
    if (isObject(cellContent)) {
        return getMarkupForObject(cellContent, `${key}`);
    }
    return cellContent;
}

function isObject(value: any) {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}

function getMarkupForObject(obj: object, id: any) {
    const propsText = JSON.stringify(obj, null, 4)
        .replaceAll('\"', '"')
        .replaceAll('\\"', '"')
        .replaceAll(' ', "&nbsp;")
        .replaceAll('\n', '<br>');
    return `<div onclick="showHideEl('${id}')"><div id="HDR-${id}">{Object ...}</div><div style="display:none" id="${id}">${propsText}</div></div>`;
}

function CreateHtmlDocument(body: string) {
    return (
        `<html>
<style>
th {
    white-space: nowrap;
}
table, th, td {
    border: 1px dotted;
    border-collapse: collapse;
    padding: 2px;
}
.fixed, thead{ 
    background-color: darkblue;
    font-bold: true;
}
.hidden{
    display: "none";
}
</style>
<body>
${body}
</body>
<script>
function showHideEl(id) {
    var x = document.getElementById(id);
    var x2 = document.getElementById("HDR-"+id);
    if (x.style.display === "none") {
        x.style.display = "block";
        x2.style.display = "none";
    } else {
        x.style.display = "none";
        x2.style.display = "block";
    }
    }
</script>
</html>`);
}