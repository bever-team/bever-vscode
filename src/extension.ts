import * as cp from 'node:child_process';
import * as path from 'node:path';
import * as vscode from 'vscode';

// bever check prints "path:line:column: error BEV1234: message" with paths relative to its working directory.
const diagnosticPattern = /^(.*):(\d+):(\d+):\s+(error|warning|info)\s+(BEV\d+):\s+(.*)$/i;

let checkTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = vscode.languages.createDiagnosticCollection('bever');
  context.subscriptions.push(diagnostics);

  const checkActiveDocument = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === 'bev') {
      scheduleCheck(editor.document, diagnostics);
    }
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => scheduleCheck(document, diagnostics)),
    vscode.workspace.onDidSaveTextDocument((document) => runCheck(document, diagnostics)),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleCheck(event.document, diagnostics)),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('bever.check')) {
        diagnostics.clear();
        checkActiveDocument();
      }
    })
  );

  checkActiveDocument();
}

export function deactivate(): void {
  if (checkTimer) {
    clearTimeout(checkTimer);
  }
}

function scheduleCheck(document: vscode.TextDocument, diagnostics: vscode.DiagnosticCollection): void {
  if (document.languageId !== 'bev' || !isCheckEnabled()) {
    return;
  }

  if (checkTimer) {
    clearTimeout(checkTimer);
  }

  checkTimer = setTimeout(() => runCheck(document, diagnostics), 500);
}

function runCheck(document: vscode.TextDocument, diagnostics: vscode.DiagnosticCollection): void {
  if (document.languageId !== 'bev') {
    return;
  }

  if (!isCheckEnabled()) {
    diagnostics.delete(document.uri);
    return;
  }

  if (document.isUntitled) {
    diagnostics.set(document.uri, [
      new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        'Save this .bev file before running Bever diagnostics.',
        vscode.DiagnosticSeverity.Information
      )
    ]);
    return;
  }

  if (document.isDirty) {
    return;
  }

  // The whole folder is checked so entities declared in other files resolve.
  const config = vscode.workspace.getConfiguration('bever.check', document.uri);
  const command = config.get<string>('command', 'bever');
  const configuredArguments = config.get<string[]>('arguments', ['check']);
  const cwd = path.dirname(document.uri.fsPath);
  const child = cp.spawn(command, [...configuredArguments, cwd], {
    cwd,
    shell: process.platform === 'win32'
  });

  let stderr = '';
  let stdout = '';

  child.stderr.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
  });

  child.stdout.on('data', (chunk: Buffer) => {
    stdout += chunk.toString();
  });

  child.on('error', (error) => {
    diagnostics.set(document.uri, [
      new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        `Could not run '${command}' to check this file (${error.message}). Install the Bever CLI with 'dotnet tool install --global Bever.Cli', or turn off the 'bever.check.enabled' setting.`,
        vscode.DiagnosticSeverity.Information
      )
    ]);
  });

  child.on('close', () => {
    diagnostics.set(document.uri, parseDiagnostics(`${stderr}\n${stdout}`, document, cwd));
  });
}

function isCheckEnabled(): boolean {
  return vscode.workspace.getConfiguration('bever.check').get<boolean>('enabled', true);
}

function parseDiagnostics(output: string, document: vscode.TextDocument, cwd: string): vscode.Diagnostic[] {
  const parsed: vscode.Diagnostic[] = [];

  for (const line of output.split(/\r?\n/)) {
    const match = diagnosticPattern.exec(line.trim());
    if (!match) {
      continue;
    }

    const [, file, lineText, columnText, severityText, code, message] = match;
    if (!sameFile(path.resolve(cwd, file), document.uri.fsPath)) {
      continue;
    }

    const lineNumber = Math.max(0, Number.parseInt(lineText, 10) - 1);
    const columnNumber = Math.max(0, Number.parseInt(columnText, 10) - 1);
    const range = document.validateRange(new vscode.Range(lineNumber, columnNumber, lineNumber, Number.MAX_SAFE_INTEGER));
    const diagnostic = new vscode.Diagnostic(range, message, toSeverity(severityText));
    diagnostic.code = code;
    diagnostic.source = 'bever';
    parsed.push(diagnostic);
  }

  return parsed;
}

function sameFile(left: string, right: string): boolean {
  return normalizePath(left) === normalizePath(right);
}

function normalizePath(file: string): string {
  const normalized = path.normalize(file).replace(/\\/g, '/');
  return process.platform === 'linux' ? normalized : normalized.toLowerCase();
}

function toSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity.toLowerCase()) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    default:
      return vscode.DiagnosticSeverity.Information;
  }
}
