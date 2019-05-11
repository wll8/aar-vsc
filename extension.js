const vscode = require('vscode');
const { exec } = require('child_process')
const fs = require('fs')
const {convert} = require('./t.js')
// convert = []

const aar = String.raw`aar.exe` // 解释器， 目前运行目录和解释器都必须位于 aardio.exe 所在目录
/** 解释器源码雏形
 * arg = _CMDLINE || '';
 * loadcode(arg)()
 */

const aardio = String.raw`C:\git2\aardio` // aar 库根目录



const warn = (msg = '没有得到任何代码') => vscode.window.showWarningMessage(msg)

function activate(context) {
  let aarTerminal = vscode.window.createTerminal('aar');

  const run = (path, code) => { // 根据路径或源码运行 aar , 传源码时路径为空
    if (!path && code) {
      path = String.raw`${require('os').tmpdir()}\aar_${Date.now()}.aardio`
      fs.writeFile(path, code, (err) => {
        if (err) throw err
      });
    }
  
    let cmd = `cd /d ${aardio} && ${aar} ${path}`
    // let cmd = `cd /d ${aardio} && cmd /c start cmd /c ${aar} ${path}` // 在弹出的 cmd 中运行
    console.log('cmd', cmd)

    aarTerminal.show(true)
    aarTerminal.sendText(cmd)

  }

  let runSelection = vscode.commands.registerCommand('aar.runSelection', function () {
    // 运行所选内容
    let editor = vscode.window.activeTextEditor
    if (editor) {
      let selection = editor.selection;
      let code = editor.document.getText(selection);
      if (code) {
        run('', code)
      }
      else {
        warn()
      }
    }

  });

  let runAll = vscode.commands.registerCommand('aar.runAll', function () {

    // 运行当前文件
    let editor = vscode.window.activeTextEditor
    if (editor) {
      let code = editor.document.getText()
      if (code.length > 0) {
        // fsPath 是以系统为基准的路径: [path => /C:/git] [fsPath => c:\git]
        let file = editor._documentData._uri.fsPath
        run(file)
      }
      else {
        warn()
      }
    }

  });

  // 通过 CompletionItemProvider 实现自动完成
  let provider = vscode.languages.registerCompletionItemProvider('aar', { // languages.id
    provideCompletionItems: (document, position) => {
      // 普通的自动补全
      const simpleCompletion = new vscode.CompletionItem('this');
      // 自定义插入文本和文档的补全
      const snippetCompletion = new vscode.CompletionItem('rget');
      // 插入文档
      snippetCompletion.insertText = new vscode.SnippetString('rget(${1:/*函数或起始位置*/},${2})');
      // 提示的文档
      snippetCompletion.documentation = new vscode.MarkdownString('参数@2通常使用一个函数调用并可能返回多个值,\n参数@1指定截取返回值的起始位置,可使用负数表示尾部倒计数');
      const commitCharacterCompletion = new vscode.CompletionItem('console');
      // 使用提交字符确定输入
      commitCharacterCompletion.commitCharacters = ['.'];
      commitCharacterCompletion.documentation = new vscode.MarkdownString('按 `.` 确认输入 `console.`');
      const commandCompletion = new vscode.CompletionItem('new');
      // 选择使用的图标
      commandCompletion.kind = vscode.CompletionItemKind.Method;
      commandCompletion.insertText = 'new ';
      // 重新触发自动完成
      commandCompletion.command = { command: 'editor.action.triggerSuggest', title: '重新触发自动完成...' };
      // 以数组形式返回所有自动完成项
      return [
        simpleCompletion,
        snippetCompletion,
        commitCharacterCompletion,
        commandCompletion
      ];

    }
  })

  // 自动提示 console 下的几个方法
  const provider2 = vscode.languages.registerCompletionItemProvider('aar', {
    provideCompletionItems(document, position) {
      // position 返回了当前在第几行， 第几个字符位置
      let linePrefix = document.lineAt(position).text.substr(0, position.character);
      // 获取当前行开始到光标位置的文档， 检查尾部是否有 console. ， 如果有， 显示一些可供选择的方法
      if (!linePrefix.endsWith('console.')) {
        return undefined;
      }
      return [
        new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
        new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
        new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
      ];
    }
  }, ['.']) // 键入 . 时触发

  const provider3 = vscode.languages.registerCompletionItemProvider('aar', {
    provideCompletionItems(document, position) {
      const arr = convert.map(item => {


        const snippetCompletion = new vscode.CompletionItem(item.completionItem);
        // 插入文档
        snippetCompletion.insertText = new vscode.SnippetString(item.insertText);
        // 图标
        snippetCompletion.kind = vscode.CompletionItemKind[item.kind];
        // 提示的文档
        snippetCompletion.documentation = item.documentation;
        return snippetCompletion
      })
      return arr;
    }
  })

  // 注册命令会返回一个可清理的对象。将此对象添加到 插件上下文中的 subscriptions 列表中。以便在不需要时 vscode 可以清理此插件命令占用的资源
  context.subscriptions.push(
    runAll,
    runSelection,
    provider,
    provider2,
    provider3,
  );

}
exports.activate = activate;
