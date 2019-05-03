const vscode = require('vscode');
const { exec } = require('child_process')
const fs = require('fs')

const aar = String.raw`aar.exe` // 解释器， 目前运行目录和解释器都必须位于 aardio.exe 所在目录
/** 解释器源码雏形
 * arg = _CMDLINE || '';
 * loadcode(arg)()
 */

const aardio = String.raw`C:\git2\aardio` // aar 库根目录

const run = (path, code) => { // 根据路径或源码运行 aar , 传源码时路径为空
  if (!path && code) {
    path = String.raw`${require('os').tmpdir()}\aar_${Date.now()}.aardio`
    fs.writeFile(path, code, (err) => {
      if (err) throw err
    });
  }

  let cmd = `cd /d ${aardio} && ${aar} ${path}`
  console.log('cmd', cmd)
  exec(cmd)
}

const warn = (msg = '没有得到任何代码') => vscode.window.showWarningMessage(msg)

function activate(context) {
  let runSelection = vscode.commands.registerCommand('aar.runSelection', function () {
    // 运行所选内容
    let editor =vscode.window.activeTextEditor
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
    context.subscriptions.push(runSelection);

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
    context.subscriptions.push(runAll);

  });


  // 示例: https://github.com/Microsoft/vscode-extension-samples/blob/master/completions-sample/src/extension.ts
  // https://www.kancloud.cn/shangyewangchuan/vs_code/972973
  vscode.languages.registerCompletionItemProvider('aar', { // languages.id
    provideCompletionItems: (document, position) => {
      return [
        {
          label: 'eq(, )',
          detail: 'eq(, )',
          documentation: new vscode.MarkdownString('比较两个对象类型是否相同'),
          insertText: new vscode.SnippetString('eq(${1}, ${2})'),
        },
        {
          label: 'rget()',
          detail: 'rget()',
          documentation: new vscode.MarkdownString('调用type函数检测对象类型\n并返回最后一个类型描述'),
          insertText: new vscode.SnippetString('rget(${1})'),
        },
        {
          label: 'null',
          detail: 'null',
          documentation: new vscode.MarkdownString('空值：基本数据类型'),
          insertText: new vscode.SnippetString('null'),
        },
        {
          label: 'pointer',
          detail: 'pointer',
          documentation: new vscode.MarkdownString('指针值：基本数据类型'),
          insertText: new vscode.SnippetString('pointer'),
        },
        {
          label: 'boolean',
          detail: 'boolean',
          documentation: new vscode.MarkdownString('布尔值：基本数据类型'),
          insertText: new vscode.SnippetString('boolean'),
        },
        {
          label: 'string',
          detail: 'string',
          documentation: new vscode.MarkdownString('字符串：基本数据类型 '),
          insertText: new vscode.SnippetString('string'),
        },
        {
          label: 'number',
          detail: 'number',
          documentation: new vscode.MarkdownString('数值：基本数据类型'),
          insertText: new vscode.SnippetString('number'),
        },
        {
          label: 'table',
          detail: 'table',
          documentation: new vscode.MarkdownString('表：基本数据类型'),
          insertText: new vscode.SnippetString('table'),
        },
        {
          label: 'buffer',
          detail: 'buffer',
          documentation: new vscode.MarkdownString('raw.buffer函数创建的缓冲区指针\n可作为字节数组使用,可传入API作为指针参数'),
          insertText: new vscode.SnippetString('buffer'),
        },
        {
          label: 'cdata',
          detail: 'cdata',
          documentation: new vscode.MarkdownString('内核对象：基本数据类型  '),
          insertText: new vscode.SnippetString('cdata'),
        },
        {
          label: 'fiber',
          detail: 'fiber',
          documentation: new vscode.MarkdownString('纤程：基本数据类型'),
          insertText: new vscode.SnippetString('fiber'),
        },
        {
          label: 'function',
          detail: 'function',
          documentation: new vscode.MarkdownString('函数：基本数据类型 '),
          insertText: new vscode.SnippetString('function'),
        },
        {
          label: 'class',
          detail: 'class',
          documentation: new vscode.MarkdownString('类：基本数据类型 '),
          insertText: new vscode.SnippetString('class'),
        },
        {
          label: 'file',
          detail: 'file',
          documentation: new vscode.MarkdownString('扩展数据类型\n使用io.open打开的文件对象 '),
          insertText: new vscode.SnippetString('file'),
        },
        {
          label: 'isString()',
          detail: 'isString()',
          documentation: new vscode.MarkdownString('参数如果string或buffer类型返回true'),
          insertText: new vscode.SnippetString('isString(${1})'),
        },
        {
          label: '(.(需要返回数据类型的变量)',
          detail: '(.(需要返回数据类型的变量)',
          documentation: new vscode.MarkdownString('检测数据类型,返回值1为基本数据类型\n如果返回两个或三个值，最后的返回值为元表中_type的值,\n结构体返回三个值，第二个返回值为结构体声明'),
          insertText: new vscode.SnippetString('(.(${1}需要返回数据类型的变量)'),
        },
      ]
    }
  }, ['type.'])

}
exports.activate = activate;
