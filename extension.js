const vscode = require('vscode');

function activate(context) {
    // 示例: https://github.com/Microsoft/vscode-extension-samples/blob/master/completions-sample/src/extension.ts
    // https://www.kancloud.cn/shangyewangchuan/vs_code/972973
    vscode.languages.registerCompletionItemProvider('aar', { // languages.id
        provideCompletionItems: (document, position) => {
            return [
              {
                label: 'eq(__, )',
                detail: 'eq(__, )',
                documentation: new vscode.MarkdownString('比较两个对象类型是否相同'),
                insertText: new vscode.SnippetString('eq(${1}, ${2})'),
              },
              {
                label: 'rget(__)',
                detail: 'rget(__)',
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
                label: 'isString(__)',
                detail: 'isString(__)',
                documentation: new vscode.MarkdownString('参数如果string或buffer类型返回true'),
                insertText: new vscode.SnippetString('isString(${1})'),
              },
              {
                label: '(.(__需要返回数据类型的变量)',
                detail: '(.(__需要返回数据类型的变量)',
                documentation: new vscode.MarkdownString('检测数据类型,返回值1为基本数据类型\n如果返回两个或三个值，最后的返回值为元表中_type的值,\n结构体返回三个值，第二个返回值为结构体声明'),
                insertText: new vscode.SnippetString('(.(${1}需要返回数据类型的变量)'),
              },
            ]
        }
    }, ['type.'])
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
