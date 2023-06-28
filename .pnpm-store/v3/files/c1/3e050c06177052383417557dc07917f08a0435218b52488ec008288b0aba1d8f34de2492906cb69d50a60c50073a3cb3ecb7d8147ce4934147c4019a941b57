const illegalChars = new Map();
illegalChars.set('\\', '\\\\');
illegalChars.set('`', '\\`');
illegalChars.set('$', '\\$');
export default function convert(s) {
    if (!s) {
        return '``';
    }
    let res = '';
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i);
        res += illegalChars.get(c) || c;
    }
    return `\`${res}\``;
}
//# sourceMappingURL=main.js.map