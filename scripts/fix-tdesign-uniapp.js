// /**
//  * fix-tdesign-uniapp.js
//  *
//  * 修复 @tdesign/uniapp 在 uni-app Vue2 小程序编译时，
//  * 模板中绑定属性（:style, :class, :t-class 等）不支持
//  * 函数调用（CallExpression）和模板字面量（TemplateLiteral）的问题。
//  *
//  * 方案：将模板中不被支持的表达式提取为 computed 属性，
//  * 模板中改为引用 computed 属性。
//  */

// const fs = require('fs');
// const path = require('path');

// // 需要处理的包
// const PACKAGES = ['@tdesign/uniapp', '@tdesign/uniapp-chat'];

// // JS 关键字和内置全局变量，不需要加 this.
// const JS_GLOBALS = new Set([
//   'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
//   'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number',
//   'Boolean', 'RegExp', 'Error', 'Map', 'Set', 'Promise',
//   'parseInt', 'parseFloat', 'isNaN', 'isFinite',
//   'console', 'window', 'document', 'navigator',
//   'typeof', 'instanceof', 'void', 'delete', 'new',
//   'this', 'arguments',
// ]);

// /**
//  * 递归查找目录中所有 .vue 文件
//  */
// function findVueFiles(dir) {
//   const results = [];
//   if (!fs.existsSync(dir)) return results;
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   for (const entry of entries) {
//     const fullPath = path.join(dir, entry.name);
//     if (entry.isDirectory()) {
//       results.push(...findVueFiles(fullPath));
//     } else if (entry.isFile() && entry.name.endsWith('.vue')) {
//       results.push(fullPath);
//     }
//   }
//   return results;
// }

// /**
//  * 将模板表达式转换为 computed 方法体中的表达式
//  * 主要工作：为顶层标识符添加 this. 前缀
//  * 处理 ES6 对象简写属性：{ color, offset } => { color: this.color, offset: this.offset }
//  */
// function templateExprToComputed(expr) {
//   let result = '';
//   let i = 0;
//   const braceStack = [];

//   while (i < expr.length) {
//     const ch = expr[i];

//     // 跳过字符串字面量（单引号）
//     if (ch === "'") {
//       let j = i + 1;
//       while (j < expr.length && expr[j] !== "'") {
//         if (expr[j] === '\\') j++;
//         j++;
//       }
//       result += expr.substring(i, j + 1);
//       i = j + 1;
//       continue;
//     }

//     // 跳过双引号字符串
//     if (ch === '"') {
//       let j = i + 1;
//       while (j < expr.length && expr[j] !== '"') {
//         if (expr[j] === '\\') j++;
//         j++;
//       }
//       result += expr.substring(i, j + 1);
//       i = j + 1;
//       continue;
//     }

//     // 处理模板字符串（需要处理 ${...} 中的表达式）
//     if (ch === '`') {
//       result += '`';
//       i++;
//       while (i < expr.length && expr[i] !== '`') {
//         if (expr[i] === '\\') {
//           result += expr[i] + expr[i + 1];
//           i += 2;
//           continue;
//         }
//         if (expr[i] === '$' && i + 1 < expr.length && expr[i + 1] === '{') {
//           result += '${';
//           i += 2;
//           let depth = 1;
//           let innerExpr = '';
//           while (i < expr.length && depth > 0) {
//             if (expr[i] === '{') depth++;
//             else if (expr[i] === '}') {
//               depth--;
//               if (depth === 0) break;
//             }
//             innerExpr += expr[i];
//             i++;
//           }
//           result += templateExprToComputed(innerExpr);
//           if (i < expr.length) {
//             result += '}';
//             i++;
//           }
//           continue;
//         }
//         result += expr[i];
//         i++;
//       }
//       if (i < expr.length) {
//         result += '`';
//         i++;
//       }
//       continue;
//     }

//     // 追踪大括号
//     if (ch === '{') {
//       braceStack.push(true);
//       result += ch;
//       i++;
//       continue;
//     }
//     if (ch === '}') {
//       braceStack.pop();
//       result += ch;
//       i++;
//       continue;
//     }

//     // 标识符
//     if (/[a-zA-Z_$]/.test(ch)) {
//       let j = i + 1;
//       while (j < expr.length && /[a-zA-Z0-9_$]/.test(expr[j])) {
//         j++;
//       }
//       const ident = expr.substring(i, j);

//       const prevNonSpace = result.trimEnd();
//       const isPropertyAccess = prevNonSpace.endsWith('.');

//       if (isPropertyAccess || JS_GLOBALS.has(ident)) {
//         result += ident;
//       } else {
//         // 检查是否在对象字面量中
//         if (braceStack.length > 0) {
//           let afterIdx = j;
//           while (afterIdx < expr.length && /\s/.test(expr[afterIdx])) afterIdx++;
//           const nextChar = afterIdx < expr.length ? expr[afterIdx] : '';

//           // 判断是否是对象键名（标识符后面紧跟 : 且不是 ::）
//           const isObjectKey = nextChar === ':' && (afterIdx + 1 >= expr.length || expr[afterIdx + 1] !== ':');

//           // 判断是否是简写属性 { color, offset } => 后面跟 , 或 } 且前面不是 : 且前面不是运算符
//           const lastChar = prevNonSpace.length > 0 ? prevNonSpace[prevNonSpace.length - 1] : '';
//           const isAfterOperator = '!~+-&|^%*/<>=?:('.indexOf(lastChar) >= 0;
//           const isShorthand = (nextChar === ',' || nextChar === '}') && !isAfterOperator;

//           if (isObjectKey) {
//             result += ident;
//           } else if (isShorthand) {
//             result += ident + ': this.' + ident;
//           } else {
//             result += 'this.' + ident;
//           }
//         } else {
//           result += 'this.' + ident;
//         }
//       }
//       i = j;
//       continue;
//     }

//     result += ch;
//     i++;
//   }

//   return result;
// }

// /**
//  * 提取模板中所有绑定属性（:xxx="..."）的完整值
//  * 匹配 :style, :custom-style, v-bind:style, :class, :t-class 等
//  * 同时匹配 v-if, v-else-if, v-show 指令（小程序中也不支持函数调用）
//  */
// function extractBindingAttrs(templateContent) {
//   const results = [];
//   // 匹配所有 v-bind 或 : 开头的属性，以及 v-if/v-else-if/v-show 指令
//   const pattern = /(?::[\w-]+|v-bind:[\w-]+|v-if|v-else-if|v-show)="([^"]*)"/g;
//   let match;

//   while ((match = pattern.exec(templateContent)) !== null) {
//     const value = match[1];
//     const fullMatch = match[0];
//     // 提取属性名（去掉 : 或 v-bind: 前缀，去掉 ="..."）
//     const eqIdx = fullMatch.indexOf('=');
//     let attrName = fullMatch.substring(0, eqIdx);
//     if (attrName.startsWith('v-bind:')) {
//       attrName = ':' + attrName.substring(7);
//     }

//     const attrStart = match.index;
//     const attrEnd = match.index + match[0].length;
//     const valueStart = match.index + match[0].indexOf('"') + 1;
//     const valueEnd = attrEnd - 1;

//     results.push({
//       fullMatch: match[0],
//       attrName,
//       value,
//       attrStart,
//       attrEnd,
//       valueStart,
//       valueEnd,
//     });
//   }

//   return results;
// }

// /**
//  * 检查绑定属性值是否包含不被支持的语法
//  * - 函数调用：xxx(...)
//  * - 模板字面量：`...`
//  * - 对象字面量：{} （在 WXML 的 {{}} 中会导致解析冲突）
//  */
// function needsFix(value) {
//   if (/[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\(/.test(value)) {
//     return true;
//   }
//   if (value.includes('`')) {
//     return true;
//   }
//   // 对象字面量 {} 在 WXML 的 {{}} mustache 中会导致解析错误
//   if (value.includes('{')) {
//     return true;
//   }
//   return false;
// }

// /**
//  * 从 v-for 表达式中提取迭代变量名
//  * 支持格式：
//  *   v-for="item in list"           => ['item']
//  *   v-for="(item, index) in list"  => ['item', 'index']
//  *   v-for="(val, key, index) in obj" => ['val', 'key', 'index']
//  */
// function extractVForIterVars(vForExpr) {
//   const vars = [];
//   // 匹配 v-for 表达式中 in/of 前面的部分
//   const match = vForExpr.match(/^\s*(?:\(\s*([^)]+)\)|(\w+))\s+(?:in|of)\s+/);
//   if (!match) return vars;

//   const iterPart = match[1] || match[2];
//   // 按逗号分割，去掉空格
//   iterPart.split(',').forEach(v => {
//     const trimmed = v.trim();
//     if (trimmed) vars.push(trimmed);
//   });
//   return vars;
// }

// /**
//  * 收集模板中指定位置处所有 v-for 作用域的迭代变量
//  * 通过简单的标签栈追踪，找出 attrPosition 处于哪些 v-for 标签的内部
//  */
// function collectVForVarsAtPosition(templateContent, attrPosition) {
//   const allVars = [];
//   // 找到 attrPosition 之前的所有 v-for 指令
//   // 使用简易方式：搜索所有开标签及其 v-for 属性，维护一个标签栈
//   // 如果一个有 v-for 的标签在 attrPosition 之前打开且未关闭，那么其迭代变量有效

//   // 先收集所有 v-for 出现的位置和变量
//   const vForPattern = /v-for="([^"]*)"/g;
//   let match;
//   const vForOccurrences = [];
//   while ((match = vForPattern.exec(templateContent)) !== null) {
//     if (match.index < attrPosition) {
//       vForOccurrences.push({
//         position: match.index,
//         vars: extractVForIterVars(match[1]),
//       });
//     }
//   }

//   // 对于每个 v-for 出现的位置，简单检查该标签是否"包围"了 attrPosition
//   // 方法：从 v-for 所在的位置向前找到开标签的 '<'，再从 attrPosition 往后检查
//   // 对应的闭标签是否在 attrPosition 之后
//   // 简化处理：如果 v-for 出现在 attrPosition 所在标签的同一个标签上，或在其祖先标签上
//   for (const vFor of vForOccurrences) {
//     // 找到该 v-for 所在的开标签起始位置
//     let tagStart = templateContent.lastIndexOf('<', vFor.position);
//     if (tagStart === -1) continue;

//     // 找到该开标签的结束位置 (第一个 > 或 />)
//     let tagEnd = templateContent.indexOf('>', tagStart);
//     if (tagEnd === -1) continue;

//     // 如果 attrPosition 在这个标签内部（即在 tagStart 和 tagEnd 之间）
//     // 说明 v-for 和当前属性在同一个标签上
//     if (attrPosition >= tagStart && attrPosition <= tagEnd) {
//       allVars.push(...vFor.vars);
//       continue;
//     }

//     // 如果 v-for 标签在 attrPosition 之前，检查是否是祖先标签
//     // 简化方式：提取标签名，然后检查从 tagEnd 到 attrPosition 之间
//     // 是否有对应的闭标签（如果没有，说明该标签包围了 attrPosition）
//     const tagNameMatch = templateContent.substring(tagStart).match(/^<(\w+)/);
//     if (!tagNameMatch) continue;
//     const tagName = tagNameMatch[1];

//     // 自闭合标签不会包围其他元素
//     const isSelfClosing = templateContent.substring(tagStart, tagEnd + 1).endsWith('/>');
//     if (isSelfClosing) continue;

//     // 在 tagEnd 和 attrPosition 之间搜索对应的闭标签
//     const between = templateContent.substring(tagEnd + 1, attrPosition);
//     // 简单统计：该标签名的开标签数 vs 闭标签数
//     const openPattern = new RegExp(`<${tagName}[\\s>]`, 'g');
//     const closePattern = new RegExp(`</${tagName}\\s*>`, 'g');
//     const opens = (between.match(openPattern) || []).length;
//     const closes = (between.match(closePattern) || []).length;

//     // 如果闭标签数量 <= 开标签数量（即没有多余的闭标签关闭 v-for 所在的标签）
//     // 说明 v-for 标签仍然包围 attrPosition
//     if (closes <= opens) {
//       allVars.push(...vFor.vars);
//     }
//   }

//   return allVars;
// }

// /**
//  * 检查表达式中是否引用了指定的变量名列表中的任一变量
//  */
// function exprUsesVars(expr, varNames) {
//   if (varNames.length === 0) return false;
//   for (const varName of varNames) {
//     // 匹配独立的标识符（不是对象属性访问的一部分）
//     const pattern = new RegExp(`(?<![.\\w$])${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w$])`, '');
//     if (pattern.test(expr)) return true;
//   }
//   return false;
// }

// /**
//  * 将 tools.cls(base, [...]) 调用内联展开为 Vue2 原生 :class 数组表达式
//  *
//  * tools.cls(base, arr) 的逻辑：
//  *   结果 = [base]
//  *   对 arr 中每个 item：
//  *     - ['key', value] → value 为真时追加 base + '--' + key
//  *     - string/number  → 值为真时追加 base + '--' + value
//  *   返回 res.join(' ')
//  *
//  * 转换示例：
//  *   tools.cls(classPrefix + '__item', [['active', item.isActive]])
//  *   → [classPrefix + '__item', item.isActive ? classPrefix + '__item' + '--active' : '']
//  *
//  * 如果表达式包含 tools.cls(...) + '...' 这种拼接，也会被处理。
//  * 返回 null 表示无法解析。
//  */
// function inlineToolsCls(expr) {
//   // 检查是否包含 tools.cls( 调用
//   if (!expr.includes('tools.cls(')) return null;

//   // 尝试解析 tools.cls(base, [...]) 的完整调用
//   // 可能有多种情况：
//   //   1. 纯 tools.cls(base, [...])
//   //   2. tools.cls(base, [...]) + ' ' + extra
//   //   3. 表达式中嵌入了 tools.cls

//   // 对于简单情况，提取 tools.cls(...) 调用
//   const clsStart = expr.indexOf('tools.cls(');
//   if (clsStart === -1) return null;

//   // 找到匹配的右括号
//   let depth = 0;
//   let clsEnd = -1;
//   for (let i = clsStart + 'tools.cls('.length; i < expr.length; i++) {
//     const ch = expr[i];
//     if (ch === "'" || ch === '"' || ch === '`') {
//       // 跳过字符串
//       let j = i + 1;
//       while (j < expr.length && expr[j] !== ch) {
//         if (expr[j] === '\\') j++;
//         j++;
//       }
//       i = j;
//     } else if (ch === '(' || ch === '[') {
//       depth++;
//     } else if (ch === ')') {
//       if (depth === 0) { clsEnd = i; break; }
//       depth--;
//     } else if (ch === ']') {
//       depth--;
//     }
//   }
//   if (clsEnd === -1) return null;

//   const innerArgs = expr.substring(clsStart + 'tools.cls('.length, clsEnd);
//   const clsCallStr = expr.substring(clsStart, clsEnd + 1);

//   // 解析 innerArgs 为 (base, [items...])
//   // 找到第一个逗号分隔的两个参数（base 和 arr）
//   // base 可能包含括号（如函数调用），需要正确解析
//   const { base, arrItems } = parseClsArgs(innerArgs);
//   if (base === null) return null;

//   // 构建内联的 :class 数组表达式
//   const parts = [base];
//   for (const item of arrItems) {
//     if (item.type === 'pair') {
//       // ['key', value] → value ? base + '--key' : ''
//       parts.push(`${item.cond} ? ${base} + '--${item.key}' : ''`);
//     } else if (item.type === 'expr') {
//       // 字符串/变量值 → expr ? base + '--' + expr : ''
//       parts.push(`${item.expr} ? ${base} + '--' + ${item.expr} : ''`);
//     }
//   }

//   const inlinedCls = '[' + parts.join(', ') + ']';

//   // 检查 tools.cls(...) 后面是否有 + '...' 拼接
//   const afterCls = expr.substring(clsEnd + 1).trim();
//   const beforeCls = expr.substring(0, clsStart).trim();

//   if (!afterCls && !beforeCls) {
//     // 纯 tools.cls(...) 调用
//     return inlinedCls;
//   }

//   // 如果有拼接，将额外的部分也加入数组
//   // 例如：tools.cls(...) + ' ' + extra → [parts..., extra]
//   // 解析 + ' ' + expr 模式，将 expr 加入数组
//   let afterStr = expr.substring(clsEnd + 1).trim();
//   let beforeStr = expr.substring(0, clsStart).trim();

//   // 提取 afterCls 中 + ' ' + expr 形式的额外 class
//   while (afterStr) {
//     const plusMatch = afterStr.match(/^\s*\+\s*'[^']*'\s*\+\s*/);
//     if (plusMatch) {
//       afterStr = afterStr.substring(plusMatch[0].length);
//       // 提取下一个表达式（到下一个 + ' ' + 或结束）
//       const nextPlusIdx = afterStr.search(/\s*\+\s*'[^']*'\s*\+\s*/);
//       if (nextPlusIdx >= 0) {
//         parts.push(afterStr.substring(0, nextPlusIdx).trim());
//         afterStr = afterStr.substring(nextPlusIdx);
//       } else {
//         parts.push(afterStr.trim());
//         afterStr = '';
//       }
//     } else if (afterStr.startsWith('+')) {
//       // + expr 形式（没有中间空格分隔符）
//       afterStr = afterStr.substring(1).trim();
//       parts.push(afterStr);
//       afterStr = '';
//     } else {
//       break;
//     }
//   }

//   // 处理前面的拼接
//   if (beforeStr) {
//     // 不太常见，简单处理
//     if (beforeStr.endsWith('+')) {
//       const extraBefore = beforeStr.substring(0, beforeStr.length - 1).trim();
//       if (extraBefore) parts.unshift(extraBefore);
//     }
//   }

//   return '[' + parts.join(', ') + ']';
// }

// /**
//  * 解析 tools.cls(base, [...]) 的参数
//  * 返回 { base, arrItems }
//  * arrItems 是一个数组，每项可能是：
//  *   { type: 'pair', key: string, cond: string } — 对应 ['key', condition]
//  *   { type: 'expr', expr: string } — 对应纯字符串/变量
//  */
// function parseClsArgs(argsStr) {
//   // 找到第一个顶层逗号（不在括号/方括号内），分割 base 和 arr
//   let depth = 0;
//   let firstComma = -1;
//   for (let i = 0; i < argsStr.length; i++) {
//     const ch = argsStr[i];
//     if (ch === "'" || ch === '"' || ch === '`') {
//       let j = i + 1;
//       while (j < argsStr.length && argsStr[j] !== ch) {
//         if (argsStr[j] === '\\') j++;
//         j++;
//       }
//       i = j;
//     } else if (ch === '(' || ch === '[') {
//       depth++;
//     } else if (ch === ')' || ch === ']') {
//       depth--;
//     } else if (ch === ',' && depth === 0) {
//       firstComma = i;
//       break;
//     }
//   }

//   if (firstComma === -1) return { base: null, arrItems: [] };

//   const base = argsStr.substring(0, firstComma).trim();
//   const arrPart = argsStr.substring(firstComma + 1).trim();

//   // arrPart 应该是 [...] 形式
//   if (!arrPart.startsWith('[') || !arrPart.endsWith(']')) {
//     return { base: null, arrItems: [] };
//   }

//   const innerArr = arrPart.substring(1, arrPart.length - 1).trim();
//   if (!innerArr) return { base, arrItems: [] };

//   // 解析数组中的每个元素（按顶层逗号分割）
//   const elements = splitTopLevel(innerArr);
//   const arrItems = [];

//   for (const elem of elements) {
//     const trimmed = elem.trim();
//     if (trimmed.startsWith('[')) {
//       // ['key', condition] 形式
//       const inner = trimmed.substring(1, trimmed.length - 1).trim();
//       const parts = splitTopLevel(inner);
//       if (parts.length >= 2) {
//         let key = parts[0].trim();
//         // 去掉引号
//         if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) {
//           key = key.substring(1, key.length - 1);
//         }
//         const cond = parts.slice(1).join(',').trim();
//         arrItems.push({ type: 'pair', key, cond });
//       }
//     } else {
//       // 纯字符串/变量表达式
//       arrItems.push({ type: 'expr', expr: trimmed });
//     }
//   }

//   return { base, arrItems };
// }

// /**
//  * 按顶层逗号分割字符串（不进入括号/方括号/字符串内部）
//  */
// function splitTopLevel(str) {
//   const parts = [];
//   let depth = 0;
//   let current = '';
//   for (let i = 0; i < str.length; i++) {
//     const ch = str[i];
//     if (ch === "'" || ch === '"' || ch === '`') {
//       current += ch;
//       let j = i + 1;
//       while (j < str.length && str[j] !== ch) {
//         if (str[j] === '\\') { current += str[j]; j++; }
//         current += str[j];
//         j++;
//       }
//       if (j < str.length) current += str[j];
//       i = j;
//     } else if (ch === '(' || ch === '[') {
//       depth++;
//       current += ch;
//     } else if (ch === ')' || ch === ']') {
//       depth--;
//       current += ch;
//     } else if (ch === ',' && depth === 0) {
//       parts.push(current);
//       current = '';
//     } else {
//       current += ch;
//     }
//   }
//   if (current.trim()) parts.push(current);
//   return parts;
// }

// /**
//  * 处理单个 .vue 文件
//  */
// function processVueFile(filePath) {
//   let content = fs.readFileSync(filePath, 'utf-8');

//   // 提取 <template> 部分
//   const templateMatch = content.match(/<template[\s\S]*?>([\s\S]*)<\/template>/);
//   if (!templateMatch) return false;

//   const templateContent = templateMatch[1];

//   // 找所有绑定属性
//   const allAttrs = extractBindingAttrs(templateContent);
//   if (allAttrs.length === 0) return false;

//   // 过滤需要修复的属性（跳过已被替换为 __tdComp 引用的，以及引用了 v-for 循环变量的）
//   const skippedVForAttrs = [];
//   const toFix = allAttrs.filter(attr => {
//     if (!needsFix(attr.value)) return false;
//     if (/^__tdComp\d+$/.test(attr.value)) return false;
//     // 检查是否引用了 v-for 的迭代变量（这类表达式不能提取为 computed，因为 computed 无法接收参数）
//     const vForVars = collectVForVarsAtPosition(templateContent, attr.attrStart);
//     if (exprUsesVars(attr.value, vForVars)) {
//       skippedVForAttrs.push(attr);
//       return false;
//     }
//     return true;
//   });

//   // 对 v-for 内部跳过的属性，尝试内联展开 tools 函数调用
//   // 注意：这里替换 templateContent（用于后续统一 template 替换），而非直接替换 content
//   let vForFixedTemplate = templateContent;
//   let hasVForFix = false;
//   for (const attr of skippedVForAttrs) {
//     // tools._style(xxx) → xxx（Vue2 的 :style 原生支持对象绑定）
//     if (attr.attrName === ':style') {
//       const styleMatch = attr.value.match(/^tools\._style\((.+)\)$/);
//       if (styleMatch) {
//         const innerExpr = styleMatch[1];
//         const fullAttrStr = `:style="${attr.value}"`;
//         const newAttrStr = `:style="${innerExpr}"`;
//         vForFixedTemplate = vForFixedTemplate.replace(fullAttrStr, newAttrStr);
//         hasVForFix = true;
//       }
//     }
//     // tools.cls(base, [...]) → 内联展开为 Vue2 原生 :class 数组语法
//     // tools.cls(base, arr) 的逻辑：base + 对 arr 中每个 item：
//     //   ['key', value] → value 为真时追加 base--key
//     //   string/number  → 值为真时追加 base--value
//     if (attr.attrName === ':class') {
//       const clsInlined = inlineToolsCls(attr.value);
//       if (clsInlined !== null) {
//         const fullAttrStr = `:class="${attr.value}"`;
//         const newAttrStr = `:class="${clsInlined}"`;
//         vForFixedTemplate = vForFixedTemplate.replace(fullAttrStr, newAttrStr);
//         hasVForFix = true;
//       }
//     }
//   }

//   if (toFix.length === 0 && !hasVForFix) return false;
//   if (toFix.length === 0) {
//     // 只有 v-for style 简化修复，直接替换模板部分写入
//     content = content.replace(templateContent, vForFixedTemplate);
//     fs.writeFileSync(filePath, content, 'utf-8');
//     return true;
//   }

//   // 检测文件中已有的 __tdComp 编号，从最大值+1开始
//   const existingCompMatch = content.match(/__tdComp(\d+)/g);
//   let nextCompIdx = 0;
//   if (existingCompMatch) {
//     const existingNums = existingCompMatch.map(m => parseInt(m.replace('__tdComp', ''), 10));
//     nextCompIdx = Math.max(...existingNums) + 1;
//   }

//   // 生成 computed 属性
//   const computedProps = [];
//   let newTemplate = vForFixedTemplate;

//   for (let i = 0; i < toFix.length; i++) {
//     const attr = toFix[i];

//     // 检查是否已有同样的表达式（去重）
//     const existingIdx = computedProps.findIndex(p => p.templateExpr === attr.value);
//     let usePropName;
//     if (existingIdx >= 0) {
//       usePropName = computedProps[existingIdx].name;
//     } else {
//       usePropName = `__tdComp${nextCompIdx + computedProps.length}`;
//       const computedExpr = templateExprToComputed(attr.value);
//       computedProps.push({
//         name: usePropName,
//         templateExpr: attr.value,
//         computedExpr,
//       });
//     }

//     // 使用字符串匹配替换（而非位置偏移量），避免 v-for 简化导致的位置错乱
//     const oldAttrStr = `${attr.attrName}="${attr.value}"`;
//     const newAttrStr = `${attr.attrName}="${usePropName}"`;
//     newTemplate = newTemplate.replace(oldAttrStr, newAttrStr);
//   }

//   // 替换模板内容
//   content = content.replace(templateMatch[1], newTemplate);

//   // 在 <script> 的 computed 中注入新属性
//   if (computedProps.length > 0) {
//     const computedCode = computedProps.map(p => {
//       return `\n    ${p.name}() { return ${p.computedExpr}; },`;
//     }).join('');

//     const computedBlockMatch = content.match(/computed\s*:\s*\{/);
//     if (computedBlockMatch) {
//       const insertPos = content.indexOf(computedBlockMatch[0]) + computedBlockMatch[0].length;
//       content = content.substring(0, insertPos) + computedCode + content.substring(insertPos);
//     } else {
//       const dataMatch = content.match(/(\s+)data\s*\(\s*\)\s*\{/);
//       const methodsMatch = content.match(/(\s+)methods\s*:\s*\{/);
//       const watchMatch = content.match(/(\s+)watch\s*:\s*\{/);

//       let insertTarget = dataMatch || methodsMatch || watchMatch;
//       if (insertTarget) {
//         const indent = insertTarget[1] || '  ';
//         const insertPos = content.indexOf(insertTarget[0]);
//         const newComputedBlock = `${indent}computed: {${computedCode}\n${indent}},\n`;
//         content = content.substring(0, insertPos) + newComputedBlock + content.substring(insertPos);
//       } else {
//         const exportMatch = content.match(/(uniComponent\s*\(\s*\{|export\s+default\s*\{)/);
//         if (exportMatch) {
//           const insertPos = content.indexOf(exportMatch[0]) + exportMatch[0].length;
//           const newComputedBlock = `\n  computed: {${computedCode}\n  },`;
//           content = content.substring(0, insertPos) + newComputedBlock + content.substring(insertPos);
//         }
//       }
//     }
//   }

//   fs.writeFileSync(filePath, content, 'utf-8');
//   return true;
// }

// /**
//  * 解析 node_modules 中包的实际路径
//  * 支持 pnpm 的嵌套结构：先尝试 node_modules/<pkg>，
//  * 如果不存在则在 .pnpm 目录中搜索
//  */
// function resolvePackagePath(rootDir, pkgName) {
//   const symlinkPath = path.join(rootDir, 'node_modules', pkgName);
//   if (fs.existsSync(symlinkPath)) {
//     try {
//       return fs.realpathSync(symlinkPath);
//     } catch {
//       return symlinkPath;
//     }
//   }

//   const pnpmDir = path.join(rootDir, 'node_modules', '.pnpm');
//   if (!fs.existsSync(pnpmDir)) return null;

//   const pnpmPkgPrefix = pkgName.replace('/', '+');
//   const entries = fs.readdirSync(pnpmDir);
//   for (const entry of entries) {
//     if (entry.startsWith(pnpmPkgPrefix + '@')) {
//       const candidatePath = path.join(pnpmDir, entry, 'node_modules', pkgName);
//       if (fs.existsSync(candidatePath)) {
//         try {
//           return fs.realpathSync(candidatePath);
//         } catch {
//           return candidatePath;
//         }
//       }
//     }
//   }

//   return null;
// }

// function main() {
//   const rootDir = path.resolve(__dirname, '..');
//   let totalFixed = 0;

//   for (const pkg of PACKAGES) {
//     const pkgPath = resolvePackagePath(rootDir, pkg);
//     if (!pkgPath) {
//       console.log(`[fix-tdesign] 跳过 ${pkg}: 未找到`);
//       continue;
//     }

//     const distDir = path.join(pkgPath, 'dist');
//     if (!fs.existsSync(distDir)) {
//       console.log(`[fix-tdesign] 跳过 ${pkg}: dist 目录不存在`);
//       continue;
//     }

//     const vueFiles = findVueFiles(distDir);
//     console.log(`[fix-tdesign] 扫描 ${pkg}: 找到 ${vueFiles.length} 个 .vue 文件`);

//     for (const filePath of vueFiles) {
//       try {
//         const fixed = processVueFile(filePath);
//         if (fixed) {
//           const relPath = path.relative(rootDir, filePath);
//           console.log(`[fix-tdesign] 已修复: ${relPath}`);
//           totalFixed++;
//         }
//       } catch (err) {
//         console.error(`[fix-tdesign] 处理失败: ${filePath}`, err.message);
//       }
//     }
//   }

//   console.log(`[fix-tdesign] 完成，共修复 ${totalFixed} 个文件`);

//   // 专项修复：button.vue 的 iconCustomStyle 计算属性缺少 innerIcon 空值保护
//   // 当 button 没有设置 icon prop 时，innerIcon 为 null，访问 null.size 会报错
//   for (const pkg of PACKAGES) {
//     const pkgPath = resolvePackagePath(rootDir, pkg);
//     if (!pkgPath) continue;

//     const buttonVuePath = path.join(pkgPath, 'dist', 'button', 'button.vue');
//     if (!fs.existsSync(buttonVuePath)) continue;

//     let buttonContent = fs.readFileSync(buttonVuePath, 'utf-8');
//     // 检查 iconCustomStyle 是否已经有空值保护
//     if (buttonContent.includes('iconCustomStyle') && !buttonContent.includes("if (!this.innerIcon) return '';")) {
//       buttonContent = buttonContent.replace(
//         /iconCustomStyle\(\)\s*\{/,
//         "iconCustomStyle() {\n      if (!this.innerIcon) return '';\n"
//       );
//       fs.writeFileSync(buttonVuePath, buttonContent, 'utf-8');
//       console.log(`[fix-tdesign] 已修复 button.vue iconCustomStyle 空值保护`);
//     }
//   }

//   // 专项修复：icon.vue
//   // <div> 改为 <view>，避免 uni-app 编译 div 为 view 时添加额外的 _div 类名
//   for (const pkg of PACKAGES) {
//     const pkgPath = resolvePackagePath(rootDir, pkg);
//     if (!pkgPath) continue;

//     const iconVuePath = path.join(pkgPath, 'dist', 'icon', 'icon.vue');
//     if (!fs.existsSync(iconVuePath)) continue;

//     let iconContent = fs.readFileSync(iconVuePath, 'utf-8');
//     let iconFixed = false;

//     // div 改为 view（渲染图标字体的元素）
//     if (iconContent.match(/<div\b/)) {
//       iconContent = iconContent.replace(/<div\b/g, '<view');
//       iconContent = iconContent.replace(/<\/div>/g, '</view>');
//       iconFixed = true;
//     }

//     if (iconFixed) {
//       fs.writeFileSync(iconVuePath, iconContent, 'utf-8');
//       console.log(`[fix-tdesign] 已修复 icon.vue (div→view)`);
//     }
//   }

//   // 专项修复：uniComponent() 包裹的 components 无法被 uni-app 编译器识别
//   // 问题：uni-app 的 babel-plugin-scoped-component 只识别 export default { components: {} }
//   // 这种标准写法，不识别 export default uniComponent({ components: {} }) 这种函数调用包裹的形式，
//   // 导致编译后的 JSON 中 usingComponents 为空，子组件无法被小程序识别。
//   // 修复方案：将 export default uniComponent({components: {...}, ...}) 改造为
//   // const _td_uniOpts = uniComponent({...}); export default { components: {...}, ..._td_uniOpts }
//   // 这样 babel 插件能通过标准的对象字面量识别到 components。
//   for (const pkg of PACKAGES) {
//     const pkgPath = resolvePackagePath(rootDir, pkg);
//     if (!pkgPath) continue;

//     const distDir = path.join(pkgPath, 'dist');
//     if (!fs.existsSync(distDir)) continue;

//     const vueFiles = findVueFiles(distDir);
//     for (const filePath of vueFiles) {
//       try {
//         let content = fs.readFileSync(filePath, 'utf-8');
//         // 匹配 export default uniComponent({ ... components: { ... }, ... })
//         // 只处理包含 components 属性的 uniComponent 调用
//         const exportMatch = content.match(/export\s+default\s+uniComponent\s*\(\s*\{/);
//         if (!exportMatch) continue;
//         // 检查是否有 components 块
//         const componentsMatch = content.match(/^(\s+)components\s*:\s*\{([^}]*)\},?/m);
//         if (!componentsMatch) continue;
//         // 检查是否已经改造过（已有 _td_uniOpts）
//         if (content.includes('_td_uniOpts')) continue;

//         const componentsBlock = componentsMatch[0];
//         const componentsIndent = componentsMatch[1];
//         const componentsBody = componentsMatch[2];

//         // 1. 从 uniComponent({...}) 参数中移除 components 块
//         content = content.replace(componentsBlock, '');
//         // 清理可能多出的空行
//         content = content.replace(/\n\n\n/g, '\n\n');

//         // 2. 将 export default uniComponent({...}) 改为
//         //    const _td_uniOpts = uniComponent({...});
//         //    export default { components: {...}, ..._td_uniOpts }
//         content = content.replace(
//           /export\s+default\s+uniComponent\s*\(/,
//           'const _td_uniOpts = uniComponent('
//         );
//         // 找到 uniComponent(...) 调用的结尾 );  并替换为
//         // );
//         // export default { components: {...}, ..._td_uniOpts }
//         content = content.replace(
//           /\}\);\s*(<\/script>|\n<\/script>)/,
//           `});

// export default {
// ${componentsIndent}components: {${componentsBody}},
//   ..._td_uniOpts,
// };
// </script>`
//         );

//         fs.writeFileSync(filePath, content, 'utf-8');
//         const relPath = path.relative(rootDir, filePath);
//         console.log(`[fix-tdesign] 已改造 uniComponent export: ${relPath}`);
//       } catch (err) {
//         console.error(`[fix-tdesign] 改造 uniComponent 失败: ${filePath}`, err.message);
//       }
//     }
//   }

// }

// main();
