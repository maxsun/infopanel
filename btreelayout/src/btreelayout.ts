// TYPES
import { BNode, BTreeUserState } from "./types";

import { render } from "./rendering";

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
      snd: document.createTextNode("??"),
      pos: 50,
      direction: "horizontal",
    },
    pos: 50,
    direction: "vertical",
  },
  pos: 25,
  direction: "horizontal",
};

const updateState = (newState: BTreeUserState) => {
  render(document.body, newState, updateState);
};

render(
  document.body,
  {
    selected: [],
    tree: initTree,
  },
  updateState
);
