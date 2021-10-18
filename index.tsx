import * as React from "react";
import * as bt from "./btreelayout/src/btreelayout";
import { BNode } from "./btreelayout/src/types";

import {
  ListPane,
  QueryPane,
  OsoInspecorProvider,
  FG,
} from "./OsoInspector/OsoInspector";

console.log("Running infopanel...");

const CounterExample = () => {
  const [n, setN] = React.useState(0);

  return (
    <div>
      <div>n: {n}</div>
      <button onClick={() => setN(n + 1)}>+</button>
    </div>
  );
};

const initTree = {
  fst: {
    fst: (
      <DndProvider backend={HTML5Backend}>
        <OsoInspecorProvider>
          <ListPane></ListPane>
        </OsoInspecorProvider>
      </DndProvider>
    ),
    snd: (
      <OsoInspecorProvider>
        <FG />
      </OsoInspecorProvider>
    ),
    pos: 50,
    direction: "horizontal",
  },
  snd: (
    <DndProvider backend={HTML5Backend}>
      <QueryPane />
    </DndProvider>
  ),
  pos: 75,
  direction: "vertical",
};

// let x: React.ReactElement = <DndProvider backend={HTML5Backend}>
// /* Your Drag-and-Drop Application */
// </DndProvider>;

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import * as ReactDOM from "react-dom";

const BT = () => {
  let ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      // console.log("!");
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

ReactDOM.render(
  <DndProvider backend={HTML5Backend}>
    <BT></BT>
  </DndProvider>,
  document.body
);
// ReactDOM.render(
//   <DndProvider />,
//   document.body.appendChild(document.createElement("DIV"))
// );
