import { BNode, Split, isSplit, isContent, BTreeUserState } from "./types";
import {
  nudge,
  getFocusUp,
  getFocusRight,
  getFocusLeft,
  getFocusDown,
  insertSplit,
  adjustSplitSize,
  rotateSplit,
  deleteNode,
  getAbsoluteSizeOfNode,
  getAbsoluteOffsetOfNode,
  Diff,
} from "./btree_utils";
import { getState } from "./btreelayout";

const PADDING_SIZE = 0;

const splitToHTML = (
  split: Split,
  id?: string,
  focusedIds?: string[],
  handlers?: EventHandlers
): HTMLElement => {
  const container = document.createElement("div");
  container.id = id;
  container.classList.add("container", split.direction);

  const fstChild = document.createElement("div");
  fstChild.appendChild(bNodeToHTML(split.fst, id + "0", focusedIds, handlers));
  fstChild.classList.add("fst");

  fstChild.style[
    split.direction === "horizontal" ? "width" : "height"
  ] = `calc(${split.pos}% - ${2 * PADDING_SIZE}px)`;

  const sndChild = document.createElement("div");
  sndChild.appendChild(bNodeToHTML(split.snd, id + "1", focusedIds, handlers));
  sndChild.classList.add("snd");

  container.append(fstChild, sndChild);

  container.onclick = handlers.onClick;

  return container;
};

interface EventHandlers {
  onClick?: (evt: MouseEvent) => void;
  //   onMouseDown?: (x: number, y: number) => void;
  onMouseDown?: (evt: MouseEvent | TouchEvent) => void;
  //   onMouseMove?: (x: number, y: number) => void;
  onMouseMove?: (evt: MouseEvent | TouchEvent) => void;
}

const bNodeToHTML = (
  node: BNode,
  id?: string,
  focusedIds?: string[],
  handlers?: EventHandlers
): HTMLElement => {
  focusedIds = focusedIds ? focusedIds : [];
  id = id ? id : "root";

  let result = null;
  if (isSplit(node)) {
    result = splitToHTML(node, id, focusedIds, handlers);
  } else if (isContent(node)) {
    let contentWrapper = document.createElement("div");
    contentWrapper.classList.add("content");
    contentWrapper.id = id;

    let tempdiv = document.createElement("div");
    tempdiv.appendChild(document.createTextNode(id));

    contentWrapper.ontouchstart = (e) => {
      handlers.onMouseDown(e);
      //   e.preventDefault();
    };

    contentWrapper.onmousedown = handlers.onMouseDown;
    contentWrapper.onmousemove = handlers.onMouseMove;
    contentWrapper.ontouchmove = handlers.onMouseMove;

    contentWrapper.appendChild(tempdiv);
    contentWrapper.appendChild(node);

    result = contentWrapper;

    // result = tempdiv;
  }
  if (focusedIds.indexOf(id) !== -1) {
    result.classList.add("focused");
  }

  return result;
};

interface MouseState {
  initX: number;
  initY: number;
  horizontalHandle?: string;
  verticalHandle?: string;
  selected?: string;
}
let mouseState: MouseState = null;

export const render = (
  root: HTMLElement,
  state: BTreeUserState,
  updateState: (s: BTreeUserState) => void
): void => {
  console.log("rendering....");
  root.innerHTML = "";

  let handleClick = (e: MouseEvent) => {
    let state = getState();
    if (state === null) return;
    let id = (e.target as Element).id;
    id = id.substring(id.indexOf("."));

    let newState = {
      tree: state.tree,
      selected: [id],
    };
    updateState(newState);
  };

  document.onkeydown = (evt) => {
    let state = getState();
    if (state === null) return;
    let n = null;
    let newState = state.tree;
    if (evt.shiftKey) {
      if (evt.key === "ArrowUp") {
        newState = nudge(newState, state.selected[0], "vertical", -5, true);
      }
      if (evt.key === "ArrowDown") {
        newState = nudge(newState, state.selected[0], "vertical", 5, true);
      }
      if (evt.key === "ArrowRight") {
        newState = nudge(newState, state.selected[0], "horizontal", 5, true);
      }
      if (evt.key === "ArrowLeft") {
        newState = nudge(newState, state.selected[0], "horizontal", -5, true);
      }
    } else {
      if (evt.key === "ArrowUp") {
        n = getFocusUp(newState, state.selected[0]);
      }
      if (evt.key === "ArrowDown") {
        n = getFocusDown(newState, state.selected[0]);
      }
      if (evt.key === "ArrowRight") {
        n = getFocusRight(newState, state.selected[0]);
      }
      if (evt.key === "ArrowLeft") {
        n = getFocusLeft(newState, state.selected[0]);
      }
    }
    if (evt.key === "Enter") {
      newState = insertSplit(newState, state.selected[0]);
      n = state.selected + "0";
    }
    if (evt.key === "Backspace") {
      newState = deleteNode(newState, state.selected[0]);
    }
    if (evt.key === "+") {
      let lastChar = state.selected[0].charAt(state.selected[0].length - 1);
      newState = adjustSplitSize(
        newState,
        state.selected[0],
        5 * (lastChar === "0" ? 1 : -1)
      );
    }
    if (evt.key === "-") {
      let lastChar = state.selected[0].charAt(state.selected[0].length - 1);

      newState = adjustSplitSize(
        newState,
        state.selected[0],
        -5 * (lastChar === "0" ? 1 : -1)
      );
    }
    if (evt.key === "r") {
      newState = rotateSplit(newState, state.selected[0]);
    }
    updateState({
      tree: newState,
      selected: n ? [n] : state.selected,
    });
  };

  const handleCursorDown = (x: number, y: number, id: string) => {
    let state = getState();
    if (state === null) return;
    let width = getAbsoluteSizeOfNode(state.tree, id, "horizontal");
    let height = getAbsoluteSizeOfNode(state.tree, id, "vertical");
    let xoffset = getAbsoluteOffsetOfNode(state.tree, id, "horizontal");
    let yoffset = getAbsoluteOffsetOfNode(state.tree, id, "vertical");

    let relativeX = (x - xoffset) / width;
    let relativeY = (y - yoffset) / height;

    let horizontalHandle = null;
    let verticalHandle = null;
    if (relativeX > 0.5) {
      horizontalHandle = "right";
    } else if (relativeX < 0.5) {
      horizontalHandle = "left";
    }
    if (relativeY > 0.5) {
      verticalHandle = "bottom";
    } else if (relativeY < 0.5) {
      verticalHandle = "top";
    }

    mouseState = {
      initX: x,
      initY: y,
      horizontalHandle: horizontalHandle,
      verticalHandle: verticalHandle,
      selected: id,
    };
  };

  const handleCursorMove = (e: TouchEvent | MouseEvent) => {
    let state = getState();
    // console.log('?')
    // if (state === null) return;
    let id = (e.target as Element).id;
    id = id.substring(id.indexOf("."));

    let rootNode = document.getElementById("root");
    var bounds = rootNode.getBoundingClientRect();
    var x = null;
    let y = null;
    if ("touches" in e) {
      x = (100 * e.touches[0].clientX) / bounds.right;
      y = (100 * e.touches[0].clientY) / bounds.bottom;
    } else {
      x = (100 * e.clientX) / bounds.right;
      y = (100 * e.clientY) / bounds.bottom;
    }
    if (mouseState) {
      let dx = x - mouseState.initX;
      let dy = y - mouseState.initY;

      let id = mouseState.selected;

      let newTree = state.tree;
      if (
        (dx > 0 && mouseState.horizontalHandle === "right") ||
        (dx < 0 && mouseState.horizontalHandle === "left")
      ) {
        newTree = nudge(state.tree, id, "horizontal", dx, true);
      } else if (dx < 0 && mouseState.horizontalHandle === "right") {
        let neighbor = getFocusRight(state.tree, id);
        if (neighbor)
          newTree = nudge(state.tree, neighbor, "horizontal", dx, true);
      } else if (dx > 0 && mouseState.horizontalHandle === "left") {
        let neighbor = getFocusLeft(state.tree, id);
        if (neighbor)
          newTree = nudge(state.tree, neighbor, "horizontal", dx, true);
      }

      if (
        (dy < 0 && mouseState.verticalHandle === "top") ||
        (dy > 0 && mouseState.verticalHandle === "bottom")
      ) {
        newTree = nudge(newTree, id, "vertical", dy, true);
      } else if (dy > 0 && mouseState.verticalHandle === "top") {
        let neighbor = getFocusUp(state.tree, id);
        if (neighbor) newTree = nudge(newTree, neighbor, "vertical", dy, true);
      } else if (dy < 0 && mouseState.verticalHandle === "bottom") {
        let neighbor = getFocusDown(state.tree, id);
        if (neighbor) newTree = nudge(newTree, neighbor, "vertical", dy, true);
      }

      updateState({
        tree: newTree,
        selected: state.selected,
      });

      mouseState = {
        initX: x,
        initY: y,
        horizontalHandle: mouseState.horizontalHandle,
        verticalHandle: mouseState.verticalHandle,
        selected: mouseState.selected,
      };
    }
  };

  root.onmouseup = (e) => {
    mouseState = null;
  };

  root.appendChild(
    bNodeToHTML(state.tree, "root", state.selected, {
      onClick: handleClick,
      onMouseDown: (e) => {
        let id = (e.target as Element).id;
        id = id.substring(id.indexOf("."));

        let rootNode = document.getElementById("root");
        var bounds = rootNode.getBoundingClientRect();
        var x = null;
        let y = null;
        if ("touches" in e) {
          x = (100 * e.touches[0].clientX) / bounds.right;
          y = (100 * e.touches[0].clientY) / bounds.bottom;
        } else {
          x = (100 * e.clientX) / bounds.right;
          y = (100 * e.clientY) / bounds.bottom;
        }

        handleCursorDown(x, y, id);
      },
      onMouseMove: handleCursorMove,
    })
  );
};

export const renderDiffs = (diffs: Diff[]): void => {
  console.log("rendering diffs...");
  //   console.log(getState());
  diffs.forEach((diff) => {
    console.log(diff);
    if (diff.editType === "changePos") {
      console.log(diff.direction);
      let currDomElem = document.getElementById(diff.nodeId).children[0];
      if (diff.direction === "vertical") {
        (currDomElem as HTMLElement).style.height = `${diff.data}%`;
      } else {
        (currDomElem as HTMLElement).style.width = `${diff.data}%`;
      }
    }
  });
};
