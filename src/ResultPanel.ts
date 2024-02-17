import * as vscode from 'vscode';

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		enableScripts: true
	};
}

export class ResultPanel {
	public static currentPanel: ResultPanel | undefined;

	public static readonly viewType = 'RedisGraph Query Result';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _title: string = "noTitle";
	private _content: string = "NoContentProvided";


	public static createOrShow(extensionUri: any, title: string, content: any) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		// If we already have a panel, show it.
		if (ResultPanel.currentPanel) {
			ResultPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside, true);
		} else {
			// Otherwise, create a new panel.
			const panel = vscode.window.createWebviewPanel(
				ResultPanel.viewType,
				'RedisGraphQueryResult',
				vscode.ViewColumn.Beside,
				getWebviewOptions(extensionUri),
			);

			ResultPanel.currentPanel = new ResultPanel(panel, extensionUri);
		}
		ResultPanel.currentPanel._title = title;
		ResultPanel.currentPanel._content = content;
		ResultPanel.currentPanel._update();
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);
	}
	public dispose() {
		ResultPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		this._panel.title = this._title;
		this._panel.webview.html = this._content;
	}
}
