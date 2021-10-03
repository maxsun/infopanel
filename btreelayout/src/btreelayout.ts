// TYPES
import {
  BNode,
  Content,
  isContent,
  Split,
  isSplit,
  Handle,
  BTreeUserState,
} from "./types";

import { render } from "./rendering";

// RENDERING

document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// document.onmousemove = (e) => {
//   if (selectedHandle) {
//     let x = (e.clientX / window.innerWidth) * 100;
//     let y = (e.clientY / window.innerHeight) * 100;
//     onHandleDrag(x, y);
//     selectedHandle = {
//       nodeId: selectedHandle.nodeId,
//       handle: selectedHandle.handle,
//       initX: (e.clientX / window.innerWidth) * 100,
//       initY: (e.clientY / window.innerHeight) * 100,
//     };
//   }
// };

// const handleMouseUp = (x: number, y: number) => {
//   console.log(">>", x, y);
//   if (selectedHandle) {
//     console.log(selectedHandle);
//     let diffX = x;
//     let diffY = y;
//     console.log(diffX, diffY);
//     // return
//     // horizontal move
//     if (selectedHandle.handle === "topleft") {
//       if (diffX > 0) {
//         let leftId = getFocusLeft(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, leftId, "horizontal", diffX, true);
//       } else {
//         STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
//       }
//       //vertical move
//       if (diffY < 0) {
//         STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
//       } else {
//         let upperId = getFocusUp(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, upperId, "vertical", diffY, true);
//       }
//       // render(document.body, STATE, []);
//     } else if (selectedHandle.handle === "topright") {
//       // top right handle
//       if (diffX < 0) {
//         let leftId = getFocusRight(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, leftId, "horizontal", diffX, true);
//       } else {
//         STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
//       }
//       //vertical move
//       if (diffY < 0) {
//         STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
//       } else {
//         let upperId = getFocusUp(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, upperId, "vertical", diffY, true);
//       }
//     } else if (selectedHandle.handle === "bottomleft") {
//       if (diffX > 0) {
//         let leftId = getFocusLeft(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, leftId, "horizontal", diffX, true);
//       } else {
//         STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
//       }
//       if (diffY > 0) {
//         STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
//       } else {
//         let upperId = getFocusDown(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, upperId, "vertical", diffY, true);
//       }
//     } else if (selectedHandle.handle === "bottomright") {
//       if (diffX < 0) {
//         let leftId = getFocusRight(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, leftId, "horizontal", diffX, true);
//       } else {
//         STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
//       }
//       if (diffY > 0) {
//         STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
//       } else {
//         let upperId = getFocusDown(
//           STATE,
//           selectedHandle.nodeId.replace("root", "")
//         );
//         STATE = nudge(STATE, upperId, "vertical", diffY, true);
//       }
//     } else {
//       throw Error("Trying to move unknown type of handle");
//     }
//   }
//   // selectedHandle = null;
// };

// document.onmouseup = (e) => {
//   selectedHandle = null;
// };

// document.ontouchend = (e) => {
//   console.log("touch end");
//   selectedHandle = null;
// };

// INIT

// let img = document.createElement("img");
// img.src =
//   "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboricua.com%2Fwp-content%2Fuploads%2F2021%2F09%2Fnew-york-city-billboards.jpg&f=1&nofb=1";

let initTree: BNode = {
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
          snd: document.createTextNode("l"),
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
