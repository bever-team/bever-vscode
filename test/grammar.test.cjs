const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const grammar = JSON.parse(fs.readFileSync(path.join(root, "syntaxes", "bev.tmLanguage.json"), "utf8"));
const snippets = JSON.parse(fs.readFileSync(path.join(root, "snippets", "bev.json"), "utf8"));
const patterns = JSON.stringify(grammar.repository);

test("highlights every construct the language supports", () => {
  const words = [
    "Import", "Export", "From", "Entity", "Action", "Identity", "Field", "By", "Anyone", "Authenticated", "OrderBy", "SearchBy", "Asc", "Desc",
    "Registration", "Enabled", "Summary", "OnDelete", "Restrict", "Cascade", "SetNull", "Pick", "As",
    "Create", "Read", "Update", "Delete", "Crud",
    "Text", "Boolean", "Int", "Decimal", "Money", "Date", "DateTime", "Time", "Email", "Phone", "Url", "Enum",
    "Present", "Label", "PluralLabel", "RecordLabel", "Listing", "Details", "Creating", "Editing", "Actions", "Fields",
    "Input", "Picker", "Mode", "Emphasis", "Confirm", "Place", "Order", "Hidden",
    "Page", "Modal", "Inline", "None", "Dropdown", "Combobox", "Default", "Primary", "Destructive",
    "Navigation", "ListingToolbar", "ListingRow", "DetailsToolbar", "True", "False",
    "Rule", "And", "Or", "Not", "In", "Null", "Today", "Now", "Role"
  ];
  for (const word of words) assert.match(patterns, new RegExp(`\\b${word}\\b`), `${word} is not highlighted`);
});

test("does not highlight planned constructs as if they worked", () => {
  for (const word of ["State", "Computed", "Transition", "Schedule", "Notify", "Image", "Multiple", "Duration", "Levels", "Inherits"]) {
    assert.doesNotMatch(patterns, new RegExp(`\\b${word}\\b`), `${word} is highlighted`);
  }
});

test("snippets use only supported syntax", () => {
  const bodies = JSON.stringify(snippets);
  for (const word of ["State", "Computed", "Transition", "Image", "Duration", "Notify"]) {
    assert.doesNotMatch(bodies, new RegExp(`\\b${word}\\b`), `a snippet uses ${word}`);
  }
  for (const snippet of Object.values(snippets)) {
    assert.ok(snippet.prefix && snippet.body && snippet.description);
  }
});
