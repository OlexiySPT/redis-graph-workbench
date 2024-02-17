import { createClient, Graph } from 'redis';
import { window } from 'vscode';
import { ResultPanel } from './ResultPanel';
import { addResult, cleanResults, buildHtmlDocument, addError } from './buildResultMarkup';

let outputChannel: any = null;
//let testView: TestView|null = null;
export function runQuery(vscode: any, context: any) {
    doRunQuery(vscode, context);
    //
}

async function doRunQuery(vscode: any, context: any) {
    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
        vscode.window.showErrorMessage('No query text in the active window');
        return;
    }
    if (!outputChannel) {
        outputChannel = window.createOutputChannel("RedisGraphQuery", { log: true });
        outputChannel.show(false);
    }

    const fileName = vscode.window.activeTextEditor.document.fileName;
    const editor = vscode.window.activeTextEditor;
    const selection = vscode.window.activeTextEditor.selection;
    let queryText = editor.document.getText();
    if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        queryText = editor.document.getText(selectionRange);
    }
    ResultPanel.createOrShow(context.extensionUri, `TR:${fileName.split('\\').pop().split('/').pop()}`, "Running..");

    // Create a new client object
    const client = createClient();
    // Connect to the database
    try {
        cleanResults();
        await client.connect();
        //Connect to graph
        const graph = new Graph(client, 'default:diagrams');
        //
        let queryParts = [queryText];
        if (queryText.indexOf(';') > -1) {
            const qryTextWoComments = removeComments(queryText);
            if ( qryTextWoComments.indexOf(';') > -1) {
                queryParts = qryTextWoComments.split(';').filter(function (it: string) { return it?.trim(); });
            }
        }
        //Run each query and show result
        for (var i = 0; i < queryParts.length; i++) {
            const queryPart = queryParts[i];
            if (queryPart === "") {
                return;
            }
            try {
                //Run Query  
                const result = await graph.query(queryPart);

                // Print the results
                console.log(result.data);
                outputChannel.info(`${result.data?.length} rows selected`);
                addResult(result.data, queryParts.length > 1 ? `Result ${i + 1}:` : "", i+1);
            }
            catch (err: any) {
                outputChannel.error(err.message);
                vscode.window.showErrorMessage('Redis Error. See OUTPUT window (RedisGraphQuery)');
                addError(err.message, queryParts.length > 1 ? `Result ${i + 1}:`:"");
            }
        }
    }
    catch (err: any) {
        outputChannel.error(err.message);
        vscode.window.showErrorMessage('Redis Initialization Error. See OUTPUT window (RedisGraphQuery)');
        addError(err.message,"General RedisGraph error:");
    }
    finally {
        client.quit();
        const markup = buildHtmlDocument();
        ResultPanel.createOrShow(context.extensionUri, `TR:${fileName.split('\\').pop().split('/').pop()}`, markup);
    }

    function removeComments(text: string) {
        //Takes a string of code, not an actual function.
        return text.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, '').trim();//Strip comments
    }

    function buildDatasetHearer(datasetNumber:number){

    }
    //vscode.window.showInformationMessage('doRunQuery finished');
}