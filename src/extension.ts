// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { runQuery } from './runQuery';
import { SidebarProvider } from './SidebarProvider';
import { TestView } from './TestView';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "redis-graph-workbench" is now active!');
	// Register the Sidebar Panel
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"redisgraphworkbench-sidebar-connection",
			sidebarProvider
		)
	);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"redisgraphworkbench-sidebar-content",
			sidebarProvider
		)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('redis-graph-workbench.runQuery', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('runQuery from redis-graph-workbench!');

		runQuery(vscode, context);
	});

	context.subscriptions.push(disposable);
	
	//new TestView(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
