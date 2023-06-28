"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDocNodes = void 0;
const tsdoc_1 = require("@microsoft/tsdoc");
const DocEmphasisSpan_1 = require("./DocEmphasisSpan");
const DocHeading_1 = require("./DocHeading");
const DocNoteBox_1 = require("./DocNoteBox");
const DocTable_1 = require("./DocTable");
const DocTableCell_1 = require("./DocTableCell");
const DocTableRow_1 = require("./DocTableRow");
class CustomDocNodes {
    static get configuration() {
        if (CustomDocNodes._configuration === undefined) {
            const configuration = new tsdoc_1.TSDocConfiguration();
            configuration.docNodeManager.registerDocNodes('@micrososft/api-documenter', [
                { docNodeKind: "EmphasisSpan" /* CustomDocNodeKind.EmphasisSpan */, constructor: DocEmphasisSpan_1.DocEmphasisSpan },
                { docNodeKind: "Heading" /* CustomDocNodeKind.Heading */, constructor: DocHeading_1.DocHeading },
                { docNodeKind: "NoteBox" /* CustomDocNodeKind.NoteBox */, constructor: DocNoteBox_1.DocNoteBox },
                { docNodeKind: "Table" /* CustomDocNodeKind.Table */, constructor: DocTable_1.DocTable },
                { docNodeKind: "TableCell" /* CustomDocNodeKind.TableCell */, constructor: DocTableCell_1.DocTableCell },
                { docNodeKind: "TableRow" /* CustomDocNodeKind.TableRow */, constructor: DocTableRow_1.DocTableRow }
            ]);
            configuration.docNodeManager.registerAllowableChildren("EmphasisSpan" /* CustomDocNodeKind.EmphasisSpan */, [
                tsdoc_1.DocNodeKind.PlainText,
                tsdoc_1.DocNodeKind.SoftBreak
            ]);
            configuration.docNodeManager.registerAllowableChildren(tsdoc_1.DocNodeKind.Section, [
                "Heading" /* CustomDocNodeKind.Heading */,
                "NoteBox" /* CustomDocNodeKind.NoteBox */,
                "Table" /* CustomDocNodeKind.Table */
            ]);
            configuration.docNodeManager.registerAllowableChildren(tsdoc_1.DocNodeKind.Paragraph, [
                "EmphasisSpan" /* CustomDocNodeKind.EmphasisSpan */
            ]);
            CustomDocNodes._configuration = configuration;
        }
        return CustomDocNodes._configuration;
    }
}
exports.CustomDocNodes = CustomDocNodes;
//# sourceMappingURL=CustomDocNodeKind.js.map