// TYPES

interface Split {
  fst: BNode;
  snd: BNode;
  pos: number; // 0-100 representing split percentage taken by fst
  direction: "vertical" | "horizontal";
}

const BORDER_WIDTH = 5;

const isSplit = (n: any): n is Split => {
  return (
    n &&
    "fst" in n &&
    isBNode(n.fst) &&
    "snd" in n &&
    isBNode(n.snd) &&
    "pos" in n
  );
};

type Content = HTMLElement | Text;
const isContent = (n: any): n is Content => {
  return n instanceof HTMLElement || n instanceof Text;
};

type BNode = Split | Content;

const isBNode = (n: any): n is BNode => {
  return isContent(n) || isSplit(n);
};

// RENDERING

const splitToHTML = (
  split: Split,
  id?: string,
  focusedIds?: string[]
): HTMLElement => {
  const container = document.createElement("div");
  container.id = id;
  container.classList.add("container", split.direction);

  const fstChild = bNodeToHTML(split.fst, id + "0", focusedIds);
  fstChild.classList.add("fst");

  fstChild.style[
    split.direction === "horizontal" ? "width" : "height"
  ] = `calc(${split.pos}% - ${2 * BORDER_WIDTH}px)`;

  const sndChild = bNodeToHTML(split.snd, id + "1", focusedIds);
  sndChild.classList.add("snd");

  container.append(fstChild, sndChild);

  container.onclick = (evt) => {
    let t = evt.target as Element;
    if (true) {
      let newFocus = [t.id];
      let selectedNode = getBNodeByKey(STATE, t.id.replace("root", ""));
      console.log("selected:", t.id, selectedNode);

      evt.stopPropagation();
      render(document.body, STATE, newFocus);
    }
  };

  document.onkeydown = (evt) => {
    let newFocus = [];
    let n = null;
    console.log(evt);
    if (evt.shiftKey) {
      if (evt.key === "ArrowUp") {
        STATE = nudge(STATE, focusedIds[0], "vertical", -1);
      }
      if (evt.key === "ArrowDown") {
        STATE = nudge(STATE, focusedIds[0], "vertical", 1);
        // n = getFocusDown(STATE, focusedIds[0]);
      }
      if (evt.key === "ArrowRight") {
        // STATE = nudgeHorizontal(STATE, focusedIds[0], -1);
        STATE = nudge(STATE, focusedIds[0], "horizontal", 1);
      }
      if (evt.key === "ArrowLeft") {
        STATE = nudge(STATE, focusedIds[0], "horizontal", -1);
      }
    } else {
      if (evt.key === "ArrowUp") {
        n = getFocusUp(STATE, focusedIds[0]);
      }
      if (evt.key === "ArrowDown") {
        n = getFocusDown(STATE, focusedIds[0]);
      }
      if (evt.key === "ArrowRight") {
        n = getFocusRight(STATE, focusedIds[0]);
      }
      if (evt.key === "ArrowLeft") {
        n = getFocusLeft(STATE, focusedIds[0]);
      }
    }
    if (evt.key === "Enter") {
      STATE = insertSplit(STATE, focusedIds[0]);
    }
    if (evt.key === "Backspace") {
      STATE = deleteNode(STATE, focusedIds[0]);
    }
    if (evt.key === "+") {
      let lastChar = focusedIds[0].charAt(focusedIds[0].length - 1);
      STATE = adjustSplitSize(
        STATE,
        focusedIds[0],
        5 * (lastChar === "0" ? 1 : -1)
      );
    }
    if (evt.key === "-") {
      let lastChar = focusedIds[0].charAt(focusedIds[0].length - 1);

      STATE = adjustSplitSize(
        STATE,
        focusedIds[0],
        -5 * (lastChar === "0" ? 1 : -1)
      );
    }
    if (evt.key === "r") {
      STATE = rotateSplit(STATE, focusedIds[0]);
    }
    newFocus.push(n !== null ? n : focusedIds[0]);
    render(document.body, STATE, newFocus);
  };
  return container;
};

const bNodeToHTML = (
  node: BNode,
  id?: string,
  focusedIds?: string[]
): HTMLElement => {
  focusedIds = focusedIds ? focusedIds : [];
  id = id ? id : "root";
  // const nodeElem = document.createElement("div");
  // nodeElem.classList.add("node");

  let result = null;
  if (isSplit(node)) {
    result = splitToHTML(node, id, focusedIds);
  } else if (isContent(node)) {
    let contentWrapper = document.createElement("div");
    contentWrapper.classList.add("content");
    contentWrapper.id = id;

    let tempdiv = document.createElement("div");
    tempdiv.appendChild(document.createTextNode(id));

    contentWrapper.appendChild(tempdiv);
    // contentWrapper.appendChild(node);
    result = contentWrapper;
    // result = tempdiv;
  }
  if (focusedIds.indexOf(id) !== -1) {
    result.classList.add("focused");
  }

  return result;
};

const render = (
  root: HTMLElement,
  node: BNode,
  focusedIds?: string[]
): void => {
  root.innerHTML = "";
  root.appendChild(bNodeToHTML(node, "root", focusedIds));
};

// UTILS

const getBNodeByKey = (rootNode: BNode, id: string): null | BNode => {
  if (id === "") return rootNode;
  if (isContent(rootNode)) return null;
  if (isSplit(rootNode)) {
    if (id[0] === "0") {
      return getBNodeByKey(rootNode.fst, id.substring(1));
    } else {
      return getBNodeByKey(rootNode.snd, id.substring(1));
    }
  }
};

const replaceNode = (
  original: BNode,
  to_replace: string,
  new_node: BNode
): BNode => {
  if (to_replace === "") return new_node;
  if (isContent(original)) return original;
  if (isSplit(original)) {
    if (to_replace[0] === "0") {
      return {
        fst: replaceNode(original.fst, to_replace.substring(1), new_node),
        snd: original.snd,
        pos: original.pos,
        direction: original.direction,
      };
    } else {
      return {
        fst: original.fst,
        snd: replaceNode(original.snd, to_replace.substring(1), new_node),
        pos: original.pos,
        direction: original.direction,
      };
    }
  }
};

const insertSplit = (root: BNode, id: string): BNode => {
  let toInsert: BNode = {
    fst: document.createElement("div"),
    snd: getBNodeByKey(root, id.replace("root", "")),
    direction: "vertical",
    pos: 50,
  };
  return replaceNode(root, id.replace("root", ""), toInsert);
};

const deleteNode = (root: BNode, id: string): BNode => {
  let parentId = id.substring(0, id.length - 1);
  let parent = getBNodeByKey(root, parentId.replace("root", "")) as Split;
  let r = null;
  if (id.charAt(id.length - 1) === "0") {
    r = parent.snd;
  } else {
    r = parent.fst;
  }
  return replaceNode(root, parentId.replace("root", ""), r);
};

const nudge = (root: BNode, id: string, direction: string, bias: number) => {
  console.log(`Nudging ${id} ${direction} ${bias}`);

  if (id.replace("root", "") === "") {
    console.log("Tried to nudge, but nowhere to go");
    return root;
  }

  const parentId = id.substring(0, id.length - 1);
  const parentNode = getBNodeByKey(root, parentId.replace("root", ""));
  if (isContent(parentNode)) {
    throw Error("parent is somehow content");
  }

  if (parentNode.direction === direction) {
    // the split is compatible with the direction we want to nudge
    let lastchr = id.charAt(id.length - 1);

    // check if moving against edge of parent split. if so, nudge parent
    if ((bias > 0 && lastchr === "1") || (bias < 0 && lastchr == "0")) {
      console.log(`Trying to move ${direction}, but cant. Will nudge parent.`);
      let nudgedParent = nudge(root, parentId, direction, bias);
      console.log(
        "Nudged parent:",
        nudgedParent,
        "now have to normalize children"
      );

      const getIdOfHighestChange = (
        node1: BNode,
        node2: BNode,
        id: string
      ): string => {
        console.log("Comparing", node1, node2);
        if (isContent(node1) && isContent(node2) && node1 !== node2) {
          return id;
        }
        if (isSplit(node1) && isSplit(node2)) {
          if (node1.pos !== node2.pos) {
            console.log("found it!");
            return id;
          } else {
            return [
              getIdOfHighestChange(node1.fst, node2.fst, id + "0"),
              getIdOfHighestChange(node1.snd, node2.snd, id + "1"),
            ].sort((a: string, b: string) => (a.length < b.length ? 1 : -1))[0];
          }
        }
      };

      let z = getIdOfHighestChange(root, nudgedParent, "");
      let gp = getBNodeByKey(root, z);

      let nudgedGp = getBNodeByKey(nudgedParent, z);
      console.log(">>", gp);
      console.log(">?>", nudgedGp);

      let opos = (gp as Split).pos;
      if (id.charAt(id.length - 1) === "0") opos = 100 - opos;
      let npos = (nudgedGp as Split).pos;
      if (id.charAt(id.length - 1) === "0") npos = 100 - npos;
      let q = (npos - opos) / opos;
      // q = q * 1.05;
      // q = -q * 0.95;
      console.log(">", opos, npos, q);
      if (opos === undefined) {
        return nudgedParent;
      }
      // after nudging, the parent's width will have increased by:
      // 5%

      let newParent = {
        fst: parentNode.fst,
        snd: parentNode.snd,
        pos:
          id.charAt(id.length - 1) === "0"
            ? 100 - (100 - parentNode.pos) / (1 + q)
            : parentNode.pos / (1 + q), // todo this has to be handles differntly if fst child
        // pos: parentNode.pos,
        direction: parentNode.direction,
      };
      return replaceNode(nudgedParent, parentId.replace("root", ""), newParent);
    }

    let newSplitParent: BNode = {
      fst: parentNode.fst,
      snd: parentNode.snd,
      pos: parentNode.pos + bias * 5,
      direction: parentNode.direction,
    };
    return replaceNode(root, parentId.replace("root", ""), newSplitParent);
  }
  console.log(
    "nudging cell in wrong direction -- nudging first available parent"
  );
  return nudge(root, parentId, direction, bias);
};

const rotateSplit = (rootNode: BNode, id: string): BNode => {
  let parentId = id.substring(0, id.length - 1);
  let parent = getBNodeByKey(rootNode, parentId.replace("root", ""));
  if (isContent(parent))
    throw Error("Trying to grow something that has `content` as a parent!");

  let newParent: Split = {
    fst: parent.fst,
    snd: parent.snd,
    pos: parent.pos,
    direction: parent.direction === "vertical" ? "horizontal" : "vertical",
  };

  return replaceNode(rootNode, parentId.replace("root", ""), newParent);
};

const adjustSplitSize = (rootNode: BNode, id: string, delta: number): BNode => {
  let parentId = id.substring(0, id.length - 1);
  console.log(parentId);
  let parent = getBNodeByKey(rootNode, parentId.replace("root", ""));
  console.log(parent);
  if (isContent(parent))
    throw Error("Trying to grow something that has `content` as a parent!");

  let newParent: Split = {
    fst: parent.fst,
    snd: parent.snd,
    pos: parent.pos + delta,
    direction: parent.direction,
  };

  return replaceNode(rootNode, parentId.replace("root", ""), newParent);

  // return parent;
};

const getFocusUp = (nodeState: BNode, currFocus: string): null | string => {
  const getFirstNodeUp = (
    currFocus: string,
    history: string[]
  ): [string, string[]] => {
    const parentId = currFocus.substring(0, currFocus.length - 1);
    const parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
    let nextFocus = null;
    if (isSplit(parent)) {
      if (parent.direction === "vertical") {
        if (currFocus.charAt(currFocus.length - 1) === "1") {
          // MOVING FROM LOWER SPLIT
          nextFocus = parentId + "0";
        } else {
          // MOVING FROM UPPER SPLIT
          [nextFocus, history] = getFirstNodeUp(parentId, history);
        }
      } else if (parent.direction === "horizontal") {
        [nextFocus, history] = getFirstNodeUp(
          parentId,
          history.concat([currFocus.charAt(currFocus.length - 1)])
        );
      }
    }
    return [nextFocus, history];
  };

  let [nextFocus, history] = getFirstNodeUp(currFocus, []);
  if (!nextFocus) return null;

  const getBottomMost = (n: string, horizontalPrefs: string[]) => {
    let currNode = getBNodeByKey(STATE, n.replace("root", ""));
    if (isContent(currNode)) return n;
    if (isSplit(currNode)) {
      if (currNode.direction === "horizontal") {
        if (horizontalPrefs.length > 0)
          return getBottomMost(n + horizontalPrefs.pop(), horizontalPrefs);
        return getBottomMost(n + "0", []); // if uncertain go to first
      } else {
        return getBottomMost(n + "1", horizontalPrefs);
      }
    }
  };
  return getBottomMost(nextFocus, history);
};

const getFocusDown = (nodeState: BNode, currFocus: string): null | string => {
  const getFirstNodeDown = (
    currFocus: string,
    history: string[]
  ): [string, string[]] => {
    const parentId = currFocus.substring(0, currFocus.length - 1);
    const parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
    let nextFocus = null;
    if (isSplit(parent)) {
      if (parent.direction === "vertical") {
        if (currFocus.charAt(currFocus.length - 1) === "0") {
          // MOVING FROM UPPER SPLIT
          nextFocus = parentId + "1";
        } else {
          // MOVING FROM LOWER SPLIT
          [nextFocus, history] = getFirstNodeDown(parentId, history);
        }
      } else if (parent.direction === "horizontal") {
        [nextFocus, history] = getFirstNodeDown(
          parentId,
          history.concat([currFocus.charAt(currFocus.length - 1)])
        );
      }
    }
    return [nextFocus, history];
  };

  let [nextFocus, history] = getFirstNodeDown(currFocus, []);
  if (!nextFocus) return null;

  const getTopMost = (n: string, horizontalPrefs: string[]) => {
    let currNode = getBNodeByKey(STATE, n.replace("root", ""));
    if (isContent(currNode)) return n;
    if (isSplit(currNode)) {
      if (currNode.direction === "horizontal") {
        if (horizontalPrefs.length > 0)
          return getTopMost(n + horizontalPrefs.pop(), horizontalPrefs);
        return getTopMost(n + "0", []); // if uncertain go to first
      } else {
        return getTopMost(n + "0", horizontalPrefs);
      }
    }
  };
  return getTopMost(nextFocus, history);
};

const getFocusRight = (nodeState: BNode, currFocus: string): null | string => {
  const getFirstNodeRight = (
    currFocus: string,
    history: string[]
  ): [string, string[]] => {
    const parentId = currFocus.substring(0, currFocus.length - 1);
    const parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
    let nextFocus = null;
    if (isSplit(parent)) {
      if (parent.direction === "horizontal") {
        if (currFocus.charAt(currFocus.length - 1) === "0") {
          // MOVING FROM LEFT SPLIT
          nextFocus = parentId + "1";
        } else {
          // MOVING FROM RIGHT SPLIT
          [nextFocus, history] = getFirstNodeRight(parentId, history);
        }
      } else if (parent.direction === "vertical") {
        [nextFocus, history] = getFirstNodeRight(
          parentId,
          history.concat([currFocus.charAt(currFocus.length - 1)])
        );
      }
    }
    return [nextFocus, history];
  };

  let [nextFocus, history] = getFirstNodeRight(currFocus, []);
  if (!nextFocus) return null;

  const getLeftMost = (n: string, horizontalPrefs: string[]) => {
    let currNode = getBNodeByKey(STATE, n.replace("root", ""));
    if (isContent(currNode)) return n;
    if (isSplit(currNode)) {
      if (currNode.direction === "vertical") {
        if (horizontalPrefs.length > 0)
          return getLeftMost(n + horizontalPrefs.pop(), horizontalPrefs);
        return getLeftMost(n + "0", []); // if uncertain go to first
      } else {
        return getLeftMost(n + "0", horizontalPrefs);
      }
    }
  };
  return getLeftMost(nextFocus, history);
};

const getFocusLeft = (nodeState: BNode, currFocus: string): null | string => {
  const getFirstNodeLeft = (
    currFocus: string,
    history: string[]
  ): [string, string[]] => {
    const parentId = currFocus.substring(0, currFocus.length - 1);
    const parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
    let nextFocus = null;
    if (isSplit(parent)) {
      if (parent.direction === "horizontal") {
        if (currFocus.charAt(currFocus.length - 1) === "1") {
          // MOVING FROM RIGHT SPLIT
          nextFocus = parentId + "0";
        } else {
          // MOVING FROM LEFT SPLIT
          [nextFocus, history] = getFirstNodeLeft(parentId, history);
        }
      } else if (parent.direction === "vertical") {
        [nextFocus, history] = getFirstNodeLeft(
          parentId,
          history.concat([currFocus.charAt(currFocus.length - 1)])
        );
      }
    }
    return [nextFocus, history];
  };

  let [nextFocus, history] = getFirstNodeLeft(currFocus, []);
  if (!nextFocus) return null;

  const getRightMost = (n: string, horizontalPrefs: string[]) => {
    let currNode = getBNodeByKey(STATE, n.replace("root", ""));
    if (isContent(currNode)) return n;
    if (isSplit(currNode)) {
      if (currNode.direction === "vertical") {
        if (horizontalPrefs.length > 0)
          return getRightMost(n + horizontalPrefs.pop(), horizontalPrefs);
        return getRightMost(n + "0", []); // if uncertain go to first
      } else {
        return getRightMost(n + "1", horizontalPrefs);
      }
    }
  };
  return getRightMost(nextFocus, history);
};

// INIT

let img = document.createElement("img");
img.src =
  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboricua.com%2Fwp-content%2Fuploads%2F2021%2F09%2Fnew-york-city-billboards.jpg&f=1&nofb=1";

// let STATE: BNode = {
//   fst: {
//     fst: document.createTextNode("hel"),
//     snd: document.createTextNode("llo"),
//     pos: 50,
//     direction: "vertical",
//   },
//   snd: {
//     fst: {
//       fst: document.createTextNode("wor"),
//       snd: {
//         fst: {
//           fst: document.createTextNode("l"),
//           snd: img,
//           pos: 50,
//           direction: "horizontal",
//         },
//         snd: document.createTextNode("d"),
//         pos: 50,
//         direction: "horizontal",
//       },
//       pos: 25,
//       direction: "vertical",
//     },
//     snd: {
//       fst: document.createTextNode("!"),
//       snd: document.createTextNode("??"),
//       pos: 50,
//       direction: "horizontal",
//     },
//     pos: 50,
//     direction: "vertical",
//   },
//   pos: 25,
//   direction: "horizontal",
// };

let STATE: BNode = {
  snd: {
    fst: document.createTextNode("l"),
    snd: {
      fst: {
        fst: document.createTextNode("1"),
        snd: {
          fst: document.createTextNode("2"),
          snd: document.createTextNode("3"),
          pos: 25,
          direction: "vertical",
        },
        pos: 50,
        direction: "vertical",
      },
      snd: document.createTextNode("2"),
      pos: 50,
      direction: "vertical",
    },
    pos: 50,
    direction: "horizontal",
  },
  fst: document.createTextNode("d"),
  pos: 50,
  direction: "horizontal",
};

render(document.body, STATE, []);
