const { EditorState, Plugin } = require("prosemirror-state");
const { EditorView, DecorationSet, Decoration } = require("prosemirror-view");
const { Schema, DOMParser } = require("prosemirror-model");
const { schema } = require("prosemirror-schema-basic");
const { exampleSetup } = require("prosemirror-example-setup");

const thButtonPlugin = () => {
  return new Plugin({
    props: {
      decorations: (state) => {
        const decorations = [];

        const decorate = (node, pos) => {
          if (node.type.name === "table_header") {
            decorations.push(
              Decoration.widget(pos + 1, () => {
                const div = document.createElement("div");
                const button = document.createElement("button");
                button.classList.add("thButton");
                div.appendChild(button);
                return div;
              })
            );
          }
        };

        state.doc.descendants(decorate);
        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
};

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: schema.spec.nodes.get("paragraph"),
    text: schema.spec.nodes.get("text"),
    table: {
      content: "table_row+",
      tableRole: "table",
      isolating: true,
      group: "block",
      parseDOM: [{ tag: "table" }],
      toDOM() {
        return ["table", ["tbody", 0]];
      },
    },
    table_row: {
      content: "(table_cell | table_header)+",
      tableRole: "row",
      parseDOM: [{ tag: "tr" }],
      toDOM() {
        return ["tr", 0];
      },
    },
    table_cell: {
      content: "inline*",
      tableRole: "cell",
      isolating: true,
      parseDOM: [{ tag: "td" }],
      toDOM() {
        return ["td", 0];
      },
    },
    table_header: {
      content: "inline*",
      tableRole: "header_cell",
      isolating: true,
      parseDOM: [{ tag: "th" }],
      toDOM() {
        return ["th", 0];
      },
    },
  },
  marks: schema.spec.marks,
});

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector("#content")
    ),
    plugins: [thButtonPlugin(), ...exampleSetup({ schema: mySchema })],
  }),
});
