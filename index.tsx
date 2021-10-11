import * as React from "react";
import * as bt from "./btreelayout/src/btreelayout";
import { BNode } from "./btreelayout/src/types";

import ForceGraph2D, { ForceGraphProps } from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

import { Pane } from "./draganddrop/dnd";
import {
  ListPane,
  QueryPane,
  OsoInspecorProvider,
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

const FG = () => {
  const fgRef = React.useRef(null);

  let [data, setData] = React.useState<ForceGraphProps["graphData"]>({
    nodes: [],
    links: [],
  });

  React.useEffect(() => {
    fetch("http://localhost:9001/api/osotest")
      .then((response) => response.json())
      .then((data) => {
        console.log(">>>", data);
        // const allOrgs = data.map((role: any) => {
        //     role.org_id
        // });
        // const allUsers = data.map((role: any) => role.user_id);
        // const allSurveys = data.map((role: any) => role.survey_id);
        // const allEntities = allOrgs
        //   .concat(allUsers)
        //   .concat(allSurveys)
        //   .filter((x: any) => x !== null)
        //   .filter((v, i, a) => a.indexOf(v) === i)
        //   .map((x: number | string) => {
        //     return {
        //       id: String(x),
        //       type: "user",
        //       name: "hello",
        //     };
        //   });

        let allLinks: any[] = [];
        let allNodes: any[] = [];

        data.forEach((role: any) => {
          if (role.survey_id) {
            allLinks.push({
              source: String(role.survey_id),
              target: String(role.user_id),
            });

            allNodes.push({
              id: String(role.survey_id),
              type: "survey",
            });
          }
          if (role.org_id) {
            allLinks.push({
              source: String(role.org_id),
              target: String(role.user_id),
            });
            allNodes.push({
              id: String(role.org_id),
              type: "organization",
            });
          }
          allNodes.push({
            id: String(role.user_id),
            type: "user",
          });
        });

        setData({
          nodes: allNodes.filter(
            (v, i, a) => a.map((n) => n.id).indexOf(v.id) === i
          ),
          links: allLinks,
        });
      });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "90%",
        border: "solid 1px red",
      }}
      onClick={(e) => {
        console.log("!");
        e.stopPropagation();
      }}
    >
      <ForceGraph3D
        graphData={data}
        width={600}
        height={600}
        nodeAutoColorBy="group"
        nodeThreeObject={(node: any) => {
          const sprite = new SpriteText(node.id);
          let cm: any = {
            user: "blue",
            survey: "orange",
            organization: "purple",
          };
          sprite.color = cm[node.type as string];
          sprite.textHeight = 8;
          return sprite;
        }}
      />
    </div>
    // <ForceGraph2D
    //   ref={fgRef}
    //   graphData={{ nodes: data.nodes, links: data.links }}
    //   //   cooldownTicks={100}
    //   nodeColor={() => "red"}
    //   nodeLabel={(node) => {
    //     console.log(node);
    //     return "test";
    //   }}
    //   //   onEngineStop={() => fgRef.current.zoomToFit(400)}
    // />
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
    snd: <FG />,
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
      console.log("!");
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
