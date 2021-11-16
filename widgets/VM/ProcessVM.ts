console.log("Processing...");

interface INode {
  id: string;
}

interface IEdge {
  source: IRef;
  target: IRef;
}

interface NodeRef {
  type: "node";
  i: number;
}

interface EdgeRef {
  type: "edge";
  i: number;
}

type IRef = NodeRef | EdgeRef;

class Graph {
  nodes: INode[] = [];
  edges: IEdge[] = [];
  // todo: add metanodes which point to sets of edges or nodes

  resolveRef(refId: number) {}

  addNode(v: string) {
    this.nodes.push({
      id: v,
    });
  }

  addEdge(sourceId: string, targetId: string) {
    let source: IRef = null;
    let target: IRef = null;
    for (let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      if (n.id === sourceId) {
        source = { type: "node", i };
      }
      if (n.id === targetId) {
        target = { type: "node", i };
      }
      if (source !== null && target !== null) {
        break;
      }
    }

    if (source && target) {
      this.edges.push({
        source,
        target,
      });
    }
  }
}

let g = new Graph();
g.addNode("a");
g.addNode("b");
g.addEdge("a", "b");

console.log(g);
