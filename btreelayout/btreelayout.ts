// TYPES

interface Split {
  fst: BNode;
  snd: BNode;
  pos: number; // 0-100 representing split percentage taken by fst
  direction: "vertical" | "horizontal";
}

const PADDING_SIZE = 0;

let selectedHandle = null;

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

  const fstChild = document.createElement("div");
  fstChild.appendChild(bNodeToHTML(split.fst, id + "0", focusedIds));
  fstChild.classList.add("fst");

  // fstChild.style[
  //   split.direction === "horizontal" ? "width" : "height"
  // ] = `calc(${split.pos}%`;
  fstChild.style[
    split.direction === "horizontal" ? "width" : "height"
  ] = `calc(${split.pos}% - ${2 * PADDING_SIZE}px)`;

  const sndChild = document.createElement("div");
  sndChild.appendChild(bNodeToHTML(split.snd, id + "1", focusedIds));
  sndChild.classList.add("snd");

  container.append(fstChild, sndChild);

  container.onclick = (evt) => {
    let t = evt.target as Element;
    if (true) {
      let newFocus = [t.id];
      let selectedNode = getBNodeByKey(STATE, t.id.replace("root", ""));
      console.log("selected:", t.id, selectedNode);

      // evt.stopPropagation();
      render(document.body, STATE, newFocus);
    }
  };

  document.onkeydown = (evt) => {
    let newFocus = [];
    let n = null;
    console.log(evt);
    if (evt.shiftKey) {
      if (evt.key === "ArrowUp") {
        STATE = nudge(STATE, focusedIds[0], "vertical", -5, true);
      }
      if (evt.key === "ArrowDown") {
        STATE = nudge(STATE, focusedIds[0], "vertical", 5, true);
      }
      if (evt.key === "ArrowRight") {
        STATE = nudge(STATE, focusedIds[0], "horizontal", 5, true);
      }
      if (evt.key === "ArrowLeft") {
        STATE = nudge(STATE, focusedIds[0], "horizontal", -5, true);
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
      n = focusedIds + "0";
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

  let result = null;
  if (isSplit(node)) {
    result = splitToHTML(node, id, focusedIds);
  } else if (isContent(node)) {
    let contentWrapper = document.createElement("div");
    contentWrapper.classList.add("content");
    contentWrapper.id = id;

    let tempdiv = document.createElement("div");
    tempdiv.appendChild(document.createTextNode(id));

    const makeHandle = (classname) => {
      const handle = document.createElement("div");
      handle.classList.add(classname, "handle");

      const onHandleSelect = (handleSpec: {nodeId: string, handle: string, initX: number, initY: number}) => {
        selectedHandle = handleSpec;
      }
      handle.onmousedown = (e) => {
        console.log("Handle Clicked for", id);
        onHandleSelect({nodeId: id, handle:classname, initX: e.clientX, initY: e.clientY});
        e.stopPropagation();
      };
      
      handle.ontouchstart = (e) => {
        console.log("handle touched", e)
        onHandleSelect({nodeId: id, handle:classname, initX: e.touches[0].screenX, initY: e.touches[0].screenY});
      }

      return handle;
    };
    contentWrapper.appendChild(makeHandle("topleft"));
    contentWrapper.appendChild(makeHandle("topright"));
    contentWrapper.appendChild(makeHandle("bottomleft"));
    contentWrapper.appendChild(makeHandle("bottomright"));

    contentWrapper.appendChild(tempdiv);

    result = contentWrapper;

    // result = tempdiv;
  }
  if (focusedIds.indexOf(id) !== -1) {
    result.classList.add("focused");
  }

  return result;
};

document.onmousemove = (e) => {
  // console.log(selectedHandle);
};


const handleMouseUp = (x, y) => {
  if (selectedHandle) {
    console.log(selectedHandle);
    let diffX = x;
    let diffY = y;
    console.log(diffX, diffY);
    // return
    // horizontal move
    if (selectedHandle.handle === "topleft") {
      if (diffX > 0) {
        let leftId = getFocusLeft(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, leftId, "horizontal", diffX, true);
      } else {
        STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
      }
      //vertical move
      if (diffY < 0) {
        STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
      } else {
        let upperId = getFocusUp(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, upperId, "vertical", diffY, true);
      }
      // render(document.body, STATE, []);
    } else if (selectedHandle.handle === "topright") {
      // top right handle
      if (diffX < 0) {
        let leftId = getFocusRight(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, leftId, "horizontal", diffX, true);
      } else {
        STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
      }
      //vertical move
      if (diffY < 0) {
        STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
      } else {
        let upperId = getFocusUp(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, upperId, "vertical", diffY, true);
      }
    } else if (selectedHandle.handle === "bottomleft") {
      if (diffX > 0) {
        let leftId = getFocusLeft(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, leftId, "horizontal", diffX, true);
      } else {
        STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
      }
      if (diffY > 0) {
        STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
      } else {
        let upperId = getFocusDown(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, upperId, "vertical", diffY, true);
      }
    } else if (selectedHandle.handle === "bottomright") {
      if (diffX < 0) {
        let leftId = getFocusRight(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, leftId, "horizontal", diffX, true);
      } else {
        STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
      }
      if (diffY > 0) {
        STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
      } else {
        let upperId = getFocusDown(
          STATE,
          selectedHandle.nodeId.replace("root", "")
        );
        STATE = nudge(STATE, upperId, "vertical", diffY, true);
      }
    } else {
      throw Error("Trying to move unknown type of handle");
    }
  }
  selectedHandle = null;
}

document.onmouseup = (e) => {
  if (selectedHandle) {
    
    handleMouseUp(((e.clientX - selectedHandle.initX) / window.innerWidth) * 100, ((e.clientY - selectedHandle.initY) / window.innerHeight) * 100)
  }
};

document.ontouchend = (e) => {
  console.log(e, selectedHandle)
  if (selectedHandle) {

    
    handleMouseUp(((e.changedTouches[0].screenX - selectedHandle.initX) / window.innerWidth) * 100, ((e.changedTouches[0].screenY - selectedHandle.initY) / window.innerHeight) * 100)
  }
  render(document.body, STATE, [])
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

const nudge = (
  root: BNode,
  id: string,
  direction: string,
  bias: number,
  absolute?: boolean
) => {
  console.log(`Nudging ${id} ${direction} ${bias}`);

  absolute = absolute ? absolute : false;

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
      let nudgedParent = nudge(root, parentId, direction, bias, absolute);
      console.log(
        "Nudged parent:",
        nudgedParent,
        "now have to normalize children"
      );

      const getChangedIds = (
        node1: BNode,
        node2: BNode,
        id: string
      ): string[] => {
        if (
          (isContent(node1) && isSplit(node2)) ||
          (isSplit(node1) && isContent(node2))
        ) {
          throw Error("comparison is off somehoow");
        }
        if (isSplit(node1) && isSplit(node2)) {
          const changedFst = getChangedIds(node1.fst, node2.fst, id + "0");
          const changedSnd = getChangedIds(node1.snd, node2.snd, id + "1");
          if (node1.pos != node2.pos) {
            return changedFst.concat(changedSnd).concat([id]);
          }
          return changedFst.concat(changedSnd);
        }
        if (isContent(node1) && isContent(node2)) {
          return node1 !== node2 ? [id] : [];
        }
        console.log("UNEXPECTED:", node1, node2);
      };

      let changes = {};
      let changedIds = getChangedIds(root, nudgedParent, "");
      changedIds.forEach((changeId) => {
        let original = getBNodeByKey(root, changeId) as Split;
        let nudged = getBNodeByKey(nudgedParent, changeId) as Split;
        let opos = (original as Split).pos;
        let npos = (nudged as Split).pos;
        let delta = npos - opos;
        changes[changeId] = delta;
      });

      console.log(`up-tree changes (while nudging ${id}):`, changes);
      changedIds = Object.keys(changes).sort((a: string, b: string) =>
        a.length < b.length ? -1 : 1
      );

      let oldSize = getAbsoluteSizeOfNode(root, parentId, direction);
      let newSize = getAbsoluteSizeOfNode(nudgedParent, parentId, direction);

      let oldOffset = getAbsoluteOffsetOfNode(root, parentId, direction);
      let newOffset = getAbsoluteOffsetOfNode(
        nudgedParent,
        parentId,
        direction
      );

      let parentOffset = getAbsoluteOffsetOfNode(
        nudgedParent,
        parentId,
        direction
      );

      console.log(`Parent (${parentId}) offset: ${oldOffset} => ${newOffset}`);

      let o = oldOffset + oldSize * (parentNode.pos / 100);

      console.log(`We want to keep the split pos at ${o}`);
      console.log(`If we set the pos to 0, it would be at ${parentOffset}`);
      console.log(
        `If we set the pos to 100, it would be at ${parentOffset + newSize}`
      );

      // If we set the pos to x, its abs position is: parentOffset + (x / 100) * newSize
      let newPos = ((o - parentOffset) / newSize) * 100;
      console.log("New pos is:", newPos);

      let newParent = {
        fst: parentNode.fst,
        snd: parentNode.snd,
        pos: newPos,
        direction: parentNode.direction,
      };
      return replaceNode(nudgedParent, parentId.replace("root", ""), newParent);
    }

    let x = 1;
    if (absolute) {
      console.log("Performing pos move for nudge on:", parentId);
      console.log(`Trying to move the line ${bias}% of root.`);
      const parentSize = getAbsoluteSizeOfNode(root, parentId, direction);
      console.log("Parent size is:", parentSize);
      const rootSize = 100;
      console.log("Root size is:", rootSize);
      x = rootSize / parentSize;
    }

    let newSplitParent: BNode = {
      fst: parentNode.fst,
      snd: parentNode.snd,
      pos: Math.max(0, Math.min(100, parentNode.pos + bias * x)),
      direction: parentNode.direction,
    };
    return replaceNode(root, parentId.replace("root", ""), newSplitParent);
  }
  console.log(
    "nudging cell in wrong direction -- nudging first available parent"
  );
  return nudge(root, parentId, direction, bias, absolute);
};

const getAbsoluteSizeOfNode = (
  rootNode: BNode,
  id: string,
  direction: string
): number => {
  // the output is 0-100 representing percent size of root, who's size never changes

  if (id.replace("root", "") === "") {
    return 100;
  }
  const ancestorId = id.slice(0, id.length - 1);
  const ancestorNode = getBNodeByKey(
    rootNode,
    ancestorId.replace("root", "")
  ) as Split;
  if (ancestorNode.direction !== direction) {
    return getAbsoluteSizeOfNode(rootNode, ancestorId, direction);
  }
  if (
    id
      .replace("root", "")
      .replace(ancestorId.replace("root", ""), "")
      .charAt(0) === "0"
  ) {
    return (
      (ancestorNode.pos / 100) *
      getAbsoluteSizeOfNode(rootNode, ancestorId, direction)
    );
  } else {
    return (
      ((100 - ancestorNode.pos) / 100) *
      getAbsoluteSizeOfNode(rootNode, ancestorId, direction)
    );
  }
};

const getAbsoluteOffsetOfNode = (
  rootNode: BNode,
  id: string,
  direction: string
): number => {
  // the output is 0-100 representing percent size of root, who's size never changes

  if (id.replace("root", "") === "") {
    return 0;
  }
  const ancestorId = id.slice(0, id.length - 1);
  const ancestorNode = getBNodeByKey(
    rootNode,
    ancestorId.replace("root", "")
  ) as Split;
  if (ancestorNode.direction !== direction) {
    return 0 + getAbsoluteOffsetOfNode(rootNode, ancestorId, direction);
  }
  if (
    id
      .replace("root", "")
      .replace(ancestorId.replace("root", ""), "")
      .charAt(0) === "0"
  ) {
    return 0 + getAbsoluteOffsetOfNode(rootNode, ancestorId, direction);
  } else {
    return (
      (ancestorNode.pos / 100) *
        getAbsoluteSizeOfNode(rootNode, ancestorId, direction) +
      getAbsoluteOffsetOfNode(rootNode, ancestorId, direction)
    );
  }
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
    console.log("PARENT IS", parentId);
    if (parentId === "") {
      return [currFocus, history];
    }
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

let STATE: BNode = {
  fst: {
    fst: document.createTextNode("hel"),
    snd: document.createTextNode("llo"),
    pos: 50,
    direction: "vertical",
  },
  snd: {
    fst: {
      fst: document.createTextNode("wor"),
      snd: {
        fst: {
          fst: document.createTextNode("l"),
          snd: img,
          pos: 50,
          direction: "horizontal",
        },
        snd: document.createTextNode("d"),
        pos: 50,
        direction: "horizontal",
      },
      pos: 25,
      direction: "vertical",
    },
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

render(document.body, STATE, []);
