// TYPES
import { BNode, BTreeUserState } from "./types";

import { render, renderDiffs } from "./rendering";
import { treeEq, treeDiff } from "./btree_utils";

// RENDERING

document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// INIT

let initTree: BNode = {
  fst: {
    fst: document.createTextNode("hel"),
    snd: document.createTextNode("llo"),
    pos: 50,
    direction: "vertical",
  },
  snd: {
    fst: document.createTextNode("wor"),
    snd: {
      fst: document.createTextNode("!"),
      snd: document.createElement("textarea"),
      pos: 50,
      direction: "horizontal",
    },
    pos: 50,
    direction: "vertical",
  },
  pos: 25,
  direction: "horizontal",
};

var state: BTreeUserState = null;

export const getState = (): BTreeUserState => {
  return state;
};

const updateState = (newState: BTreeUserState) => {
  if (
    state &&
    JSON.stringify(state.selected) === JSON.stringify(newState.selected) &&
    treeEq(state.tree, newState.tree)
  ) {
    console.log("No change -- skipping render!");
  } else {
    console.log(state);
    // render(document.body, newState, updateState);
    if (state) {
      console.log(state.tree);
      let diffs = treeDiff(state.tree, newState.tree, "root");
      console.log(diffs);
      renderDiffs(diffs);
    }
    state = newState;
  }
};

render(
  document.body,
  {
    selected: [],
    tree: initTree,
  },
  updateState
);
updateState({
  selected: [],
  tree: initTree,
});
