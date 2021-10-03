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
} from "./btree_utils";

const PADDING_SIZE = 0;

const splitToHTML = (
  split: Split,
  id?: string,
  focusedIds?: string[],
  onClick?: (evt: MouseEvent) => void
): HTMLElement => {
  const container = document.createElement("div");
  container.id = id;
  container.classList.add("container", split.direction);

  const fstChild = document.createElement("div");
  fstChild.appendChild(bNodeToHTML(split.fst, id + "0", focusedIds));
  fstChild.classList.add("fst");

  fstChild.style[
    split.direction === "horizontal" ? "width" : "height"
  ] = `calc(${split.pos}% - ${2 * PADDING_SIZE}px)`;

  const sndChild = document.createElement("div");
  sndChild.appendChild(bNodeToHTML(split.snd, id + "1", focusedIds));
  sndChild.classList.add("snd");

  container.append(fstChild, sndChild);

  container.onclick = onClick;
  //   container.onclick = (evt) => {
  //     let t = evt.target as Element;
  //     if (true) {
  //       let newFocus = [t.id];
  //       let selectedNode = getBNodeByKey(STATE, t.id.replace("root", ""));
  //       console.log("selected:", t.id, selectedNode);
  //       render(document.body, STATE, newFocus);
  //     }
  //   };

  //   container.ondrag = (evt) => {
  //     console.log("!!!", evt);
  //   };

  //     newFocus.push(n !== null ? n : focusedIds[0]);
  //     render(document.body, STATE, newFocus);
  //   };
  return container;
};

const bNodeToHTML = (
  node: BNode,
  id?: string,
  focusedIds?: string[],
  onClick?: (evt: MouseEvent) => void
): HTMLElement => {
  focusedIds = focusedIds ? focusedIds : [];
  id = id ? id : "root";

  let result = null;
  if (isSplit(node)) {
    result = splitToHTML(node, id, focusedIds, onClick);
  } else if (isContent(node)) {
    let contentWrapper = document.createElement("div");
    contentWrapper.classList.add("content");
    contentWrapper.id = id;

    let tempdiv = document.createElement("div");
    tempdiv.appendChild(document.createTextNode(id));

    // const makeHandle = (classname: string) => {
    //   const handle = document.createElement("div");
    //   handle.classList.add(classname, "handle");

    //   const onHandleSelect = (handleSpec: {
    //     nodeId: string;
    //     handle: string;
    //     initX: number;
    //     initY: number;
    //   }) => {
    //     selectedHandle = handleSpec;
    //   };
    //   handle.onmousedown = (e) => {
    //     console.log("Handle Clicked for", id);
    //     onHandleSelect({
    //       nodeId: id,
    //       handle: classname,
    //       initX: (e.clientX / window.innerWidth) * 100,
    //       initY: (e.clientY / window.innerHeight) * 100,
    //     });
    //     e.stopPropagation();
    //   };
    //   return handle;
    // };

    contentWrapper.ontouchstart = (e) => {
      console.log("!!!!!!");
      //   selectedHandle = {
      //     nodeId: id,
      //     handle: "",
      //     initX: (e.touches[0].screenX / window.innerWidth) * 100,
      //     initY: (e.touches[0].screenY / window.innerHeight) * 100,
      //   };
    };

    contentWrapper.ontouchmove = (e) => {
      //   if (selectedHandle) {
      //     let x = (e.changedTouches[0].screenX / window.innerWidth) * 100;
      //     let y = (e.changedTouches[0].screenY / window.innerHeight) * 100;
      //     if (
      //       Math.abs(x - selectedHandle.initX) > 0.5 ||
      //       Math.abs(y - selectedHandle.initY) > 0.5
      //     ) {
      //       let xdiff = x - selectedHandle.initX;
      //       let ydiff = y - selectedHandle.initY;
      //       let type = null;
      //       if (xdiff >= 0) {
      //         if (ydiff >= 0) {
      //           type = "bottomright";
      //         } else {
      //           type = "topright";
      //         }
      //       } else {
      //         if (ydiff <= 0) {
      //           type = "bottomleft";
      //         } else {
      //           type = "topleft";
      //         }
      //       }
      //       selectedHandle = {
      //         nodeId: selectedHandle.nodeId,
      //         handle: type,
      //         initX: selectedHandle.initX,
      //         initY: selectedHandle.initY,
      //       };
      //       onHandleDrag(x, y);
      //       selectedHandle = {
      //         nodeId: selectedHandle.nodeId,
      //         handle: type,
      //         initX: x,
      //         initY: y,
      //       };
      //     }
      //   }
    };

    // contentWrapper.appendChild(makeHandle("topleft"));
    // contentWrapper.appendChild(makeHandle("topright"));
    // contentWrapper.appendChild(makeHandle("bottomleft"));
    // contentWrapper.appendChild(makeHandle("bottomright"));

    contentWrapper.appendChild(tempdiv);

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
  root.innerHTML = "";

  let handleClick = (e: MouseEvent) => {
    console.log(e);
    let id = (e.target as Element).id;
    id = id.substring(id.indexOf("."));

    let newState = {
      tree: state.tree,
      selected: [id],
    };
    updateState(newState);
    // handleClick(e);
  };

  document.onkeydown = (evt) => {
    let newFocus = [];
    let n = null;
    let newState = state.tree;
    console.log(evt);
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

  root.onmousedown = (e) => {
    let id = (e.target as Element).id;
    id = id.substring(id.indexOf("."));
    console.log(id, e);

    let width = getAbsoluteSizeOfNode(state.tree, id, "horizontal");
    let height = getAbsoluteSizeOfNode(state.tree, id, "vertical");
    let xoffset = getAbsoluteOffsetOfNode(state.tree, id, "horizontal");
    let yoffset = getAbsoluteOffsetOfNode(state.tree, id, "vertical");

    let rootNode = document.getElementById("root");

    var bounds = rootNode.getBoundingClientRect();
    var x = (100 * e.clientX) / bounds.right;
    var y = (100 * e.clientY) / bounds.bottom;

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

    // console.log(xoffset, yoffset, width, height);
    mouseState = {
      initX: (e.clientX / window.innerWidth) * 100,
      initY: (e.clientY / window.innerHeight) * 100,
      horizontalHandle: horizontalHandle,
      verticalHandle: verticalHandle,
      selected: id,
    };
  };

  document.onmousemove = (e) => {
    if (mouseState) {
      let x = (e.clientX / window.innerWidth) * 100;
      let y = (e.clientY / window.innerHeight) * 100;

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

  document.onmouseup = (e) => {
    mouseState = null;
  };

  root.appendChild(
    bNodeToHTML(state.tree, "root", state.selected, handleClick)
  );
};
