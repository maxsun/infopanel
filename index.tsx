import * as React from "react";
import * as bt from "./btreelayout/src/btreelayout";
import { BNode } from "./btreelayout/src/types";

import "./widgets/VM/ProcessVM";

console.log("Running infopanel...");

const initTree = {
  fst: {
    fst: <div>1</div>,
    snd: <div>2</div>,
    pos: 50,
    direction: "horizontal",
  },
  snd: <div>3</div>,
  pos: 75,
  direction: "vertical",
};

import * as ReactDOM from "react-dom";

const BT = () => {
  let ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      bt.render(
        ref.current,
        {
          selected: [],
          tree: initTree as BNode,
        },
        bt.updateState
      );
      bt.updateState({
        selected: [],
        tree: initTree as BNode,
      });
    }
  }, []);

  return <div ref={ref}></div>;
};

ReactDOM.render(<BT></BT>, document.body);
