var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/uglifycss/uglifycss-lib.js
var require_uglifycss_lib = __commonJS({
  "node_modules/uglifycss/uglifycss-lib.js"(exports, module2) {
    var { readFileSync } = require("fs");
    var { sep, resolve } = require("path");
    var SEP = "/";
    var PATH_SEP = sep;
    var ___PRESERVED_TOKEN_ = "___PRESERVED_TOKEN_";
    var defaultOptions = {
      maxLineLen: 0,
      expandVars: false,
      uglyComments: false,
      cuteComments: false,
      convertUrls: "",
      debug: false,
      output: ""
    };
    function convertRelativeUrls(css, options, preservedTokens) {
      const pattern = /(url\s*\()\s*(["']?)/g;
      const maxIndex = css.length - 1;
      const sb = [];
      let appendIndex = 0;
      let match;
      while ((match = pattern.exec(css)) !== null) {
        let startIndex = match.index + match[1].length;
        let terminator = match[2];
        if (terminator.length === 0) {
          terminator = ")";
        }
        let foundTerminator = false;
        let endIndex = pattern.lastIndex - 1;
        while (foundTerminator === false && endIndex + 1 <= maxIndex) {
          endIndex = css.indexOf(terminator, endIndex + 1);
          if (endIndex > 0 && css.charAt(endIndex - 1) !== "\\") {
            foundTerminator = true;
            if (terminator != ")") {
              endIndex = css.indexOf(")", endIndex);
            }
          }
        }
        sb.push(css.substring(appendIndex, match.index));
        if (foundTerminator) {
          let token = css.substring(startIndex, endIndex).replace(/(^\s*|\s*$)/g, "");
          if (token.slice(0, 19) !== ___PRESERVED_TOKEN_) {
            if (terminator === "'" || terminator === '"') {
              token = token.slice(1, -1);
            } else if (terminator === ")") {
              terminator = "";
            }
            let url;
            if (options.convertUrls && token.charAt(0) !== SEP && token.slice(0, 7) !== "http://" && token.slice(0, 8) !== "https://") {
              let target = options.target.slice();
              token = token.split(SEP).join(PATH_SEP);
              url = resolve(options.source.join(PATH_SEP), token).split(PATH_SEP);
              let file = url.pop();
              while (target[0] === url[0]) {
                target.shift();
                url.shift();
              }
              for (let i = 0, l = target.length; i < l; ++i) {
                target[i] = "..";
              }
              url = terminator + [...target, ...url, file].join(SEP) + terminator;
            } else {
              url = terminator + token + terminator;
            }
            preservedTokens.push(url);
            let preserver = "url(" + ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___)";
            sb.push(preserver);
          } else {
            sb.push(`url(${token})`);
          }
          appendIndex = endIndex + 1;
        } else {
          sb.push(css.substring(match.index, pattern.lastIndex));
          appendIndex = pattern.lastIndex;
        }
      }
      sb.push(css.substring(appendIndex));
      return sb.join("");
    }
    function extractDataUrls(css, preservedTokens) {
      const pattern = /url\(\s*(["']?)data\:/g;
      const maxIndex = css.length - 1;
      const sb = [];
      let appendIndex = 0;
      let match;
      while ((match = pattern.exec(css)) !== null) {
        let startIndex = match.index + 4;
        let terminator = match[1];
        if (terminator.length === 0) {
          terminator = ")";
        }
        let foundTerminator = false;
        let endIndex = pattern.lastIndex - 1;
        while (foundTerminator === false && endIndex + 1 <= maxIndex) {
          endIndex = css.indexOf(terminator, endIndex + 1);
          if (endIndex > 0 && css.charAt(endIndex - 1) !== "\\") {
            foundTerminator = true;
            if (terminator != ")") {
              endIndex = css.indexOf(")", endIndex);
            }
          }
        }
        sb.push(css.substring(appendIndex, match.index));
        if (foundTerminator) {
          let token = css.substring(startIndex, endIndex);
          let parts = token.split(",");
          if (parts.length > 1 && parts[0].slice(-7) == ";base64") {
            token = token.replace(/\s+/g, "");
          } else {
            token = token.replace(/\n/g, " ");
            token = token.replace(/\s+/g, " ");
            token = token.replace(/(^\s+|\s+$)/g, "");
          }
          preservedTokens.push(token);
          let preserver = "url(" + ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___)";
          sb.push(preserver);
          appendIndex = endIndex + 1;
        } else {
          sb.push(css.substring(match.index, pattern.lastIndex));
          appendIndex = pattern.lastIndex;
        }
      }
      sb.push(css.substring(appendIndex));
      return sb.join("");
    }
    function compressHexColors(css) {
      const pattern = /(\=\s*?["']?)?#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])(\}|[^0-9a-f{][^{]*?\})/gi;
      const sb = [];
      let index = 0;
      let match;
      while ((match = pattern.exec(css)) !== null) {
        sb.push(css.substring(index, match.index));
        let isFilter = match[1];
        if (isFilter) {
          sb.push(match[1] + "#" + (match[2] + match[3] + match[4] + match[5] + match[6] + match[7]));
        } else {
          if (match[2].toLowerCase() == match[3].toLowerCase() && match[4].toLowerCase() == match[5].toLowerCase() && match[6].toLowerCase() == match[7].toLowerCase()) {
            sb.push("#" + (match[3] + match[5] + match[7]).toLowerCase());
          } else {
            sb.push("#" + (match[2] + match[3] + match[4] + match[5] + match[6] + match[7]).toLowerCase());
          }
        }
        index = pattern.lastIndex = pattern.lastIndex - match[8].length;
      }
      sb.push(css.substring(index));
      return sb.join("");
    }
    function keyframes(content, preservedTokens) {
      const pattern = /@[a-z0-9-_]*keyframes\s+[a-z0-9-_]+\s*{/gi;
      let index = 0;
      let buffer;
      const preserve = (part, i) => {
        part = part.replace(/(^\s|\s$)/g, "");
        if (part.charAt(0) === "0") {
          preservedTokens.push(part);
          buffer[i] = ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___";
        }
      };
      while (true) {
        let level = 0;
        buffer = "";
        let startIndex = content.slice(index).search(pattern);
        if (startIndex < 0) {
          break;
        }
        index += startIndex;
        startIndex = index;
        let len = content.length;
        let buffers = [];
        for (; index < len; ++index) {
          let ch = content.charAt(index);
          if (ch === "{") {
            if (level === 0) {
              buffers.push(buffer.replace(/(^\s|\s$)/g, ""));
            } else if (level === 1) {
              buffer = buffer.split(",");
              buffer.forEach(preserve);
              buffers.push(buffer.join(",").replace(/(^\s|\s$)/g, ""));
            }
            buffer = "";
            level += 1;
          } else if (ch === "}") {
            if (level === 2) {
              buffers.push("{" + buffer.replace(/(^\s|\s$)/g, "") + "}");
              buffer = "";
            } else if (level === 1) {
              content = content.slice(0, startIndex) + buffers.shift() + "{" + buffers.join("") + content.slice(index);
              break;
            }
            level -= 1;
          }
          if (level < 0) {
            break;
          } else if (ch !== "{" && ch !== "}") {
            buffer += ch;
          }
        }
      }
      return content;
    }
    function collectComments(content, comments) {
      const table = [];
      let from = 0;
      let end;
      while (true) {
        let start = content.indexOf("/*", from);
        if (start > -1) {
          end = content.indexOf("*/", start + 2);
          if (end > -1) {
            comments.push(content.slice(start + 2, end));
            table.push(content.slice(from, start));
            table.push("/*___PRESERVE_CANDIDATE_COMMENT_" + (comments.length - 1) + "___*/");
            from = end + 2;
          } else {
            end = -2;
            break;
          }
        } else {
          break;
        }
      }
      table.push(content.slice(end + 2));
      return table.join("");
    }
    function processString2(content = "", options = defaultOptions) {
      const comments = [];
      const preservedTokens = [];
      let pattern;
      content = extractDataUrls(content, preservedTokens);
      content = convertRelativeUrls(content, options, preservedTokens);
      content = collectComments(content, comments);
      pattern = /("([^\\"]|\\.|\\)*")|('([^\\']|\\.|\\)*')/g;
      content = content.replace(pattern, (token) => {
        const quote = token.substring(0, 1);
        token = token.slice(1, -1);
        if (token.indexOf("___PRESERVE_CANDIDATE_COMMENT_") >= 0) {
          for (let i = 0, len = comments.length; i < len; i += 1) {
            token = token.replace("___PRESERVE_CANDIDATE_COMMENT_" + i + "___", comments[i]);
          }
        }
        token = token.replace(/progid:DXImageTransform.Microsoft.Alpha\(Opacity=/gi, "alpha(opacity=");
        preservedTokens.push(token);
        return quote + ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___" + quote;
      });
      for (let i = 0, len = comments.length; i < len; i += 1) {
        let token = comments[i];
        let placeholder = "___PRESERVE_CANDIDATE_COMMENT_" + i + "___";
        if (token.charAt(0) === "!") {
          if (options.cuteComments) {
            preservedTokens.push(token.substring(1).replace(/\r\n/g, "\n"));
          } else if (options.uglyComments) {
            preservedTokens.push(token.substring(1).replace(/[\r\n]/g, ""));
          } else {
            preservedTokens.push(token);
          }
          content = content.replace(placeholder, ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
          continue;
        }
        if (token.charAt(token.length - 1) === "\\") {
          preservedTokens.push("\\");
          content = content.replace(placeholder, ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
          i = i + 1;
          preservedTokens.push("");
          content = content.replace("___PRESERVE_CANDIDATE_COMMENT_" + i + "___", ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
          continue;
        }
        if (token.length === 0) {
          let startIndex = content.indexOf(placeholder);
          if (startIndex > 2) {
            if (content.charAt(startIndex - 3) === ">") {
              preservedTokens.push("");
              content = content.replace(placeholder, ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
            }
          }
        }
        content = content.replace(`/*${placeholder}*/`, "");
      }
      if (options.expandVars) {
        const vars = {};
        pattern = /@variables\s*\{\s*([^\}]+)\s*\}/g;
        content = content.replace(pattern, (_, f1) => {
          pattern = /\s*([a-z0-9\-]+)\s*:\s*([^;\}]+)\s*/gi;
          f1.replace(pattern, (_2, f12, f2) => {
            if (f12 && f2) {
              vars[f12] = f2;
            }
            return "";
          });
          return "";
        });
        pattern = /var\s*\(\s*([^\)]+)\s*\)/g;
        content = content.replace(pattern, (_, f1) => {
          return vars[f1] || "none";
        });
      }
      content = content.replace(/\s+/g, " ");
      pattern = /calc\(([^;}]*)\)/g;
      content = content.replace(pattern, (_, f1) => {
        preservedTokens.push("calc(" + f1.replace(/(^\s*|\s*$)/g, "").replace(/\( /g, "(").replace(/ \)/g, ")") + ")");
        return ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___";
      });
      pattern = /\s*filter:\s*progid:DXImageTransform.Microsoft.Matrix\(([^\)]+)\);/g;
      content = content.replace(pattern, (_, f1) => {
        preservedTokens.push(f1);
        return "filter:progid:DXImageTransform.Microsoft.Matrix(" + ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___);";
      });
      pattern = /(^|\})(([^\{:])+:)+([^\{]*\{)/g;
      content = content.replace(pattern, (token) => token.replace(/:/g, "___PSEUDOCLASSCOLON___"));
      content = content.replace(/\s+([!{};:>+\(\)\],])/g, "$1");
      content = content.replace(/!important/g, " !important");
      content = content.replace(/___PSEUDOCLASSCOLON___/g, ":");
      pattern = /\s*(animation|animation-delay|animation-duration|transition|transition-delay|transition-duration):\s*([^;}]+)/gi;
      content = content.replace(pattern, (_, f1, f2) => {
        f2 = f2.replace(/(^|\D)0?\.?0(m?s)/gi, (_2, g1, g2) => {
          preservedTokens.push("0" + g2);
          return g1 + ___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___";
        });
        return f1 + ":" + f2;
      });
      pattern = /\s*(flex|flex-basis):\s*([^;}]+)/gi;
      content = content.replace(pattern, (_, f1, f2) => {
        let f2b = f2.split(/\s+/);
        preservedTokens.push(f2b.pop());
        f2b.push(___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
        f2b = f2b.join(" ");
        return `${f1}:${f2b}`;
      });
      content = content.replace(/(hsla?)\(([^)]+)\)/g, (_, f1, f2) => {
        var f0 = [];
        f2.split(",").forEach((part) => {
          part = part.replace(/(^\s+|\s+$)/g, "");
          if (part === "0%") {
            preservedTokens.push("0%");
            f0.push(___PRESERVED_TOKEN_ + (preservedTokens.length - 1) + "___");
          } else {
            f0.push(part);
          }
        });
        return f1 + "(" + f0.join(",") + ")";
      });
      content = keyframes(content, preservedTokens);
      content = content.replace(/:first-(line|letter)(\{|,)/gi, (_, f1, f2) => ":first-" + f1.toLowerCase() + " " + f2);
      if (options.cuteComments) {
        content = content.replace(/\s*\/\*/g, "___PRESERVED_NEWLINE___/*");
        content = content.replace(/\*\/\s*/g, "*/___PRESERVED_NEWLINE___");
      } else {
        content = content.replace(/\*\/\s*/g, "*/");
      }
      pattern = /^(.*)(@charset)( "[^"]*";)/gi;
      content = content.replace(pattern, (_, f1, f2, f3) => f2.toLowerCase() + f3 + f1);
      pattern = /^((\s*)(@charset)( [^;]+;\s*))+/gi;
      content = content.replace(pattern, (_, __, f2, f3, f4) => f2 + f3.toLowerCase() + f4);
      pattern = /@(font-face|import|(?:-(?:atsc|khtml|moz|ms|o|wap|webkit)-)?keyframe|media|page|namespace)/gi;
      content = content.replace(pattern, (_, f1) => "@" + f1.toLowerCase());
      pattern = /:(active|after|before|checked|disabled|empty|enabled|first-(?:child|of-type)|focus|hover|last-(?:child|of-type)|link|only-(?:child|of-type)|root|:selection|target|visited)/gi;
      content = content.replace(pattern, (_, f1) => ":" + f1.toLowerCase());
      content = content.replace(/^(.*)(@charset \"[^\"]*\";)/g, "$2$1");
      content = content.replace(/^(\s*@charset [^;]+;\s*)+/g, "$1");
      pattern = /:(lang|not|nth-child|nth-last-child|nth-last-of-type|nth-of-type|(?:-(?:atsc|khtml|moz|ms|o|wap|webkit)-)?any)\(/gi;
      content = content.replace(pattern, (_, f1) => ":" + f1.toLowerCase() + "(");
      pattern = /([:,\( ]\s*)(attr|color-stop|from|rgba|to|url|(?:-(?:atsc|khtml|moz|ms|o|wap|webkit)-)?(?:calc|max|min|(?:repeating-)?(?:linear|radial)-gradient)|-webkit-gradient)/gi;
      content = content.replace(pattern, (_, f1, f2) => f1 + f2.toLowerCase());
      content = content.replace(/\band\(/gi, "and (");
      content = content.replace(/([!{}:;>+\(\[,])\s+/g, "$1");
      content = content.replace(/;+\}/g, "}");
      content = content.replace(/(^|[^.0-9\\])(?:0?\.)?0(?:ex|ch|r?em|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|g?rad|turn|m?s|k?Hz|dpi|dpcm|dppx|%)/gi, "$10");
      content = content.replace(/([0-9])\.0(ex|ch|r?em|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|g?rad|turn|m?s|k?Hz|dpi|dpcm|dppx|%| |;)/gi, "$1$2");
      content = content.replace(/:0 0 0 0(;|\})/g, ":0$1");
      content = content.replace(/:0 0 0(;|\})/g, ":0$1");
      content = content.replace(/:0 0(;|\})/g, ":0$1");
      pattern = /(background-position|transform-origin|webkit-transform-origin|moz-transform-origin|o-transform-origin|ms-transform-origin|box-shadow):0(;|\})/gi;
      content = content.replace(pattern, (_, f1, f2) => f1.toLowerCase() + ":0 0" + f2);
      content = content.replace(/(:|\s)0+\.(\d+)/g, "$1.$2");
      pattern = /rgb\s*\(\s*([0-9,\s]+)\s*\)/gi;
      content = content.replace(pattern, (_, f1) => {
        const rgbcolors = f1.split(",");
        let hexcolor = "#";
        for (let i = 0; i < rgbcolors.length; i += 1) {
          let val = parseInt(rgbcolors[i], 10);
          if (val < 16) {
            hexcolor += "0";
          }
          if (val > 255) {
            val = 255;
          }
          hexcolor += val.toString(16);
        }
        return hexcolor;
      });
      content = compressHexColors(content);
      content = content.replace(/(:|\s)(#f00)(;|})/g, "$1red$3");
      content = content.replace(/(:|\s)(#000080)(;|})/g, "$1navy$3");
      content = content.replace(/(:|\s)(#808080)(;|})/g, "$1gray$3");
      content = content.replace(/(:|\s)(#808000)(;|})/g, "$1olive$3");
      content = content.replace(/(:|\s)(#800080)(;|})/g, "$1purple$3");
      content = content.replace(/(:|\s)(#c0c0c0)(;|})/g, "$1silver$3");
      content = content.replace(/(:|\s)(#008080)(;|})/g, "$1teal$3");
      content = content.replace(/(:|\s)(#ffa500)(;|})/g, "$1orange$3");
      content = content.replace(/(:|\s)(#800000)(;|})/g, "$1maroon$3");
      pattern = /(border|border-top|border-right|border-bottom|border-left|outline|background):none(;|\})/gi;
      content = content.replace(pattern, (_, f1, f2) => f1.toLowerCase() + ":0" + f2);
      content = content.replace(/progid:DXImageTransform\.Microsoft\.Alpha\(Opacity=/gi, "alpha(opacity=");
      content = content.replace(/\(([\-A-Za-z]+):([0-9]+)\/([0-9]+)\)/g, "($1:$2___QUERY_FRACTION___$3)");
      content = content.replace(/[^\};\{\/]+\{\}/g, "");
      content = content.replace(/___QUERY_FRACTION___/g, "/");
      if (options.maxLineLen > 0) {
        const lines = [];
        let line = [];
        for (let i = 0, len = content.length; i < len; i += 1) {
          let ch = content.charAt(i);
          line.push(ch);
          if (ch === "}" && line.length > options.maxLineLen) {
            lines.push(line.join(""));
            line = [];
          }
        }
        if (line.length) {
          lines.push(line.join(""));
        }
        content = lines.join("\n");
      }
      content = content.replace(/;;+/g, ";");
      content = content.replace(/(^\s*|\s*$)/g, "");
      for (let i = preservedTokens.length - 1; i >= 0; i--) {
        content = content.replace(___PRESERVED_TOKEN_ + i + "___", preservedTokens[i], "g");
      }
      content = content.replace(/___PRESERVED_NEWLINE___/g, "\n");
      return content;
    }
    function processFiles(filenames = [], options = defaultOptions) {
      if (options.convertUrls) {
        options.target = resolve(process.cwd(), options.convertUrls).split(PATH_SEP);
      }
      const uglies = [];
      filenames.forEach((filename) => {
        try {
          const content = readFileSync(filename, "utf8");
          if (content.length) {
            if (options.convertUrls) {
              options.source = resolve(process.cwd(), filename).split(PATH_SEP);
              options.source.pop();
            }
            uglies.push(processString2(content, options));
          }
        } catch (e) {
          if (options.debug) {
            console.error(`uglifycss: unable to process "${filename}"
${e.stack}`);
          } else {
            console.error(`uglifycss: unable to process "${filename}"
	${e}`);
          }
          process.exit(1);
        }
      });
      return uglies.join("");
    }
    module2.exports = {
      defaultOptions,
      processString: processString2,
      processFiles
    };
  }
});

// node_modules/uglifycss/index.js
var require_uglifycss = __commonJS({
  "node_modules/uglifycss/index.js"(exports, module2) {
    module2.exports = require_uglifycss_lib();
  }
});

// packages/lit-css/lit-css.ts
var lit_css_exports = {};
__export(lit_css_exports, {
  transform: () => transform
});
module.exports = __toCommonJS(lit_css_exports);

// node_modules/string-to-template-literal/dist/main.js
var illegalChars = /* @__PURE__ */ new Map();
illegalChars.set("\\", "\\\\");
illegalChars.set("`", "\\`");
illegalChars.set("$", "\\$");
function convert(s) {
  if (!s) {
    return "``";
  }
  let res = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    res += illegalChars.get(c) || c;
  }
  return `\`${res}\``;
}

// packages/lit-css/lit-css.ts
var import_uglifycss = __toESM(require_uglifycss(), 1);
async function transform({
  css: source,
  filePath,
  specifier = "lit",
  tag = "css",
  uglify = false,
  transform: transform2 = (x) => x
}) {
  const css = await transform2(source, { filePath });
  const uglifyOptions = typeof uglify === "object" ? uglify : void 0;
  const cssContent = !uglify ? css : (0, import_uglifycss.processString)(css, uglifyOptions);
  return `import {${tag}} from '${specifier}';
export const styles = ${tag}${convert(cssContent)};
export default styles;
`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transform
});
//# sourceMappingURL=lit-css.cjs.map
