const vscode = require('vscode');
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const absPath = str => path.join(__dirname, str)
const {convert} = require('./t.js')
// convert = []

const aar = 'aar.exe' // 解释器， 目前运行目录和解释器都必须位于 aardio.exe 所在目录
/** 解释器源码雏形
 * arg = _CMDLINE || '';
 * loadcode(arg)()
 */

const warn = (msg = '没有得到任何代码') => vscode.window.showWarningMessage(msg)

const getConfig = () => {
  const config = {...vscode.workspace.getConfiguration(`aar`)}
  console.log('config', config)
  Object.keys(config).forEach(key => {
    const val = config[key]
    if(val === `` || val === undefined) {
      key === `aardioDir` && (config[key] = absPath(`./aardio`));
      key === `keepWindow` && (config[key] = `exit`);
      key === `runInvscodeTerminal` && (config[key] = false);
    }
  })
  console.log('config2', config)
  return config
}
const config = getConfig()

fs.exists(config.aardioDir, exists => {
  if(!exists){
    warn('请检查 aardio.exe 所在目录是否配置正确')
  }
})

// 文档选择器, 使用此对象, 而不是直接 'aar'. https://github.com/bazelbuild/vscode-bazel/issues/47
const selectors = { scheme: 'file', language: 'aar' }

const activate = context => {
  const aarExe = `${config.aardioDir}\\${aar}`
  fs.exists(aarExe, exists => {
    if(!exists){
      fs.writeFileSync(aarExe, fs.readFileSync(absPath('./aar.exe'))) // 复制文件
      const cmd = `attrib +h ${aarExe}` // 让目录看起来没有多余的文件
      exec(cmd)
    }
  })
  
  let aarTerminal = null
  
  vscode.window.onDidCloseTerminal(() => {  // 标记整个终端程序被关闭时后
    aarTerminal = null
  });

  const run = (code, editor) => {
    const config = getConfig()
    let codeFile = `${require('os').tmpdir()}\\aar_${Date.now()}.aardio` // 保存到系统临时目录
    fs.writeFile(codeFile, code, (err) => {
      if (err) throw err
    });

    let cmd = `pushd ${config.aardioDir} && ${aar} ${codeFile} && popd`
    let codeDir = editor ? path.parse(editor._documentData._uri.fsPath).dir : ''
    if(config.runInvscodeTerminal) { // true: 在 vscode 终端运行. false: 在新开 cmd 中运行. 新开 cmd 仿真度高.
      if (aarTerminal === null) {
        aarTerminal = vscode.window.createTerminal('aar');
      }
      aarTerminal.show(true)
      aarTerminal.sendText(cmd)
    } else {
      const keepWindow = config.keepWindow
      // 两个 cmd 为了保证开启一个 cmd 窗口
      keepWindow === `noWin` && exec(cmd)
      keepWindow === `keyExit` && exec(`cmd /c start cmd /c "pushd ${config.aardioDir} && ${aar} ${codeFile} && pushd ${codeDir} && echo. && echo Press any key to close. && pause>nul"`)
      keepWindow === `exit` && exec(`cmd /c start cmd /c "pushd ${config.aardioDir} && ${aar} ${codeFile} && pushd ${codeDir}"`)
      keepWindow === `keep` && exec(`cmd /c start cmd /k "pushd ${config.aardioDir} && ${aar} ${codeFile} && pushd ${codeDir}"`)
    }
    
  }


  let runAll = vscode.commands.registerCommand('aar.runAll', () => {

    let editor = vscode.window.activeTextEditor
    if (editor) {
      
      let selection = editor.selection
      let code = editor.document.getText(selection) || editor.document.getText()
      if (code.length > 0) {
        // fsPath 是以系统为基准的路径: [path => /C:/git] [fsPath => c:\git]
        // let file = editor._documentData._uri.fsPath
        // run(file)
        // 直接使用源文件去运行时 arr 会把改变源文件的编码为 utf8bom
        run(code, editor)
      }
      else {
        warn()
      }
    }

  });

  // 通过 CompletionItemProvider 实现自动完成
  let provider = vscode.languages.registerCompletionItemProvider(selectors, { // languages.id
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
  const provider2 = vscode.languages.registerCompletionItemProvider(selectors, {
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

  const provider3 = vscode.languages.registerCompletionItemProvider(selectors, {
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
    provider,
    provider2,
    provider3,
  );

}
exports.activate = activate;
