// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const didYouMean = require('didyoumean');
const dictionary = Array.from(getWordsFromFile());

function getWordsFromFile() {
    // Get the active text file editor gegetWordsFromFile()
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return new Set(); // No active editor, return an empty
    }

    // Get the full content of the file 
    const document = editor.document;
    const fileContent = document.getText();

    // Regular expression to match words (alphanumeric characters and underscores)
    const wordRegex = /\b\w+\b/g;
    let match;
    const wordSet = new Set();

    // Find all matches in the file content
    while ((match = wordRegex.exec(fileContent)) !== null) {
        wordSet.add(match[0]);
    }

    return wordSet;
}

function getWord() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return; // No active editor
    }

    // Get the current cursor position
    const position = editor.selection.active;

    // Get the text of the current line up to the cursor position
    const lineText = editor.document.lineAt(position.line).text.substring(0, position.character);

    // Trim any trailing whitespace before searching for the word
    const trimmedLineText = lineText.trimEnd();

    // Use a regular expression to find the last word before any trailing whitespace,
    // skipping over non-word characters like brackets, quotes, etc.
    const match = trimmedLineText.match(/[\w]+(?=\W*$)/);

    if (match) {
        return match[0]; // The word directly to the left of the cursor
    } else {
        return null; // No word found
    }
}


function replaceWord(newWord) {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) return; // No active editor, exit the function

    // Get the current cursor position
    const { line, character } = editor.selection.active;

    // Get the text of the current line up to the cursor position and trim any trailing whitespace
    const lineText = editor.document.lineAt(line).text.substring(0, character).trimEnd();

    // Use a regular expression to find the last word before any trailing non-word characters
    const match = lineText.match(/[\w]+(?=\W*$)/);

    // If a word is found, replace it
		if (match) {
        const wordStart = character - match[0].length - 1;
        const wordRange = new vscode.Range(new vscode.Position(line, wordStart), new vscode.Position(line, character));

        editor.edit(editBuilder => {
            editBuilder.replace(wordRange, newWord);
        });
    } else {
        vscode.window.showInformationMessage('No word found to replace.');
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
  * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('autocorrectmock.getWord', function () {
        const word = getWord();
				const correctedWord = didYouMean(word, dictionary);;
				
        if (word) {
            vscode.window.showInformationMessage(`${word}, ${correctedWord}`);
        } else {
            vscode.window.showInformationMessage('N/A');
        }
				replaceWord(correctedWord)
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
