import stringToTemplateLiteral from "string-to-template-literal";
import { processString } from "uglifycss";
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
  const cssContent = !uglify ? css : processString(css, uglifyOptions);
  return `import {${tag}} from '${specifier}';
export const styles = ${tag}${stringToTemplateLiteral(cssContent)};
export default styles;
`;
}
export {
  transform
};
//# sourceMappingURL=lit-css.js.map
