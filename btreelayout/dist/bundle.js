/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/btree_utils.ts":
/*!****************************!*\
  !*** ./src/btree_utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBNodeByKey": () => (/* binding */ getBNodeByKey),
/* harmony export */   "replaceNode": () => (/* binding */ replaceNode),
/* harmony export */   "insertSplit": () => (/* binding */ insertSplit),
/* harmony export */   "deleteNode": () => (/* binding */ deleteNode),
/* harmony export */   "nudge": () => (/* binding */ nudge),
/* harmony export */   "getAbsoluteSizeOfNode": () => (/* binding */ getAbsoluteSizeOfNode),
/* harmony export */   "getAbsoluteOffsetOfNode": () => (/* binding */ getAbsoluteOffsetOfNode),
/* harmony export */   "rotateSplit": () => (/* binding */ rotateSplit),
/* harmony export */   "adjustSplitSize": () => (/* binding */ adjustSplitSize),
/* harmony export */   "getFocusUp": () => (/* binding */ getFocusUp),
/* harmony export */   "getFocusDown": () => (/* binding */ getFocusDown),
/* harmony export */   "getFocusRight": () => (/* binding */ getFocusRight),
/* harmony export */   "getFocusLeft": () => (/* binding */ getFocusLeft),
/* harmony export */   "treeEq": () => (/* binding */ treeEq),
/* harmony export */   "treeDiff": () => (/* binding */ treeDiff)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/types.ts");
// UTILS

var getBNodeByKey = function (rootNode, id) {
    if (id === "")
        return rootNode;
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(rootNode))
        return null;
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(rootNode)) {
        if (id[0] === "0") {
            return getBNodeByKey(rootNode.fst, id.substring(1));
        }
        else {
            return getBNodeByKey(rootNode.snd, id.substring(1));
        }
    }
};
var replaceNode = function (original, to_replace, new_node) {
    if (to_replace === "")
        return new_node;
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(original))
        return original;
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(original)) {
        if (to_replace[0] === "0") {
            return {
                fst: replaceNode(original.fst, to_replace.substring(1), new_node),
                snd: original.snd,
                pos: original.pos,
                direction: original.direction,
            };
        }
        else {
            return {
                fst: original.fst,
                snd: replaceNode(original.snd, to_replace.substring(1), new_node),
                pos: original.pos,
                direction: original.direction,
            };
        }
    }
};
var insertSplit = function (root, id) {
    var toInsert = {
        fst: document.createElement("div"),
        snd: getBNodeByKey(root, id.replace("root", "")),
        direction: "vertical",
        pos: 50,
    };
    return replaceNode(root, id.replace("root", ""), toInsert);
};
var deleteNode = function (root, id) {
    var parentId = id.substring(0, id.length - 1);
    var parent = getBNodeByKey(root, parentId.replace("root", ""));
    var r = null;
    if (id.charAt(id.length - 1) === "0") {
        r = parent.snd;
    }
    else {
        r = parent.fst;
    }
    return replaceNode(root, parentId.replace("root", ""), r);
};
var nudge = function (root, id, direction, bias, absolute) {
    // console.log(`Nudging ${id} ${direction} ${bias}`);
    absolute = absolute ? absolute : false;
    if (id.replace("root", "") === "") {
        // console.log("Tried to nudge, but nowhere to go");
        return root;
    }
    var parentId = id.substring(0, id.length - 1);
    var parentNode = getBNodeByKey(root, parentId.replace("root", ""));
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(parentNode)) {
        throw Error("parent is somehow content");
    }
    if (parentNode.direction === direction) {
        // the split is compatible with the direction we want to nudge
        var lastchr = id.charAt(id.length - 1);
        // check if moving against edge of parent split. if so, nudge parent
        if ((bias > 0 && lastchr === "1") || (bias < 0 && lastchr == "0")) {
            // console.log(`Trying to move ${direction}, but cant. Will nudge parent.`);
            var nudgedParent_1 = nudge(root, parentId, direction, bias, absolute);
            // console.log(
            //   "Nudged parent:",
            //   nudgedParent,
            //   "now have to normalize children"
            // );
            var getChangedIds_1 = function (node1, node2, id) {
                if (((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(node1) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(node2)) ||
                    ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(node1) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(node2))) {
                    throw Error("comparison is off somehoow");
                }
                if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(node1) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(node2)) {
                    var changedFst = getChangedIds_1(node1.fst, node2.fst, id + "0");
                    var changedSnd = getChangedIds_1(node1.snd, node2.snd, id + "1");
                    if (node1.pos != node2.pos) {
                        return changedFst.concat(changedSnd).concat([id]);
                    }
                    return changedFst.concat(changedSnd);
                }
                if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(node1) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(node2)) {
                    return node1 !== node2 ? [id] : [];
                }
                console.log("UNEXPECTED:", node1, node2);
            };
            var changes_1 = {};
            var changedIds = getChangedIds_1(root, nudgedParent_1, "");
            changedIds.forEach(function (changeId) {
                var original = getBNodeByKey(root, changeId);
                var nudged = getBNodeByKey(nudgedParent_1, changeId);
                var opos = original.pos;
                var npos = nudged.pos;
                var delta = npos - opos;
                changes_1[changeId] = delta;
            });
            // console.log(`up-tree changes (while nudging ${id}):`, changes);
            // changedIds = Object.keys(changes).sort((a: string, b: string) =>
            //   a.length < b.length ? -1 : 1
            // );
            var oldSize = getAbsoluteSizeOfNode(root, parentId, direction);
            var newSize = getAbsoluteSizeOfNode(nudgedParent_1, parentId, direction);
            var oldOffset = getAbsoluteOffsetOfNode(root, parentId, direction);
            var newOffset = getAbsoluteOffsetOfNode(nudgedParent_1, parentId, direction);
            var parentOffset = getAbsoluteOffsetOfNode(nudgedParent_1, parentId, direction);
            // console.log(`Parent (${parentId}) offset: ${oldOffset} => ${newOffset}`);
            var o = oldOffset + oldSize * (parentNode.pos / 100);
            // console.log(`We want to keep the split pos at ${o}`);
            // console.log(`If we set the pos to 0, it would be at ${parentOffset}`);
            // console.log(
            //   `If we set the pos to 100, it would be at ${parentOffset + newSize}`
            // );
            // If we set the pos to x, its abs position is: parentOffset + (x / 100) * newSize
            var newPos = ((o - parentOffset) / newSize) * 100;
            // console.log("New pos is:", newPos);
            var newParent = {
                fst: parentNode.fst,
                snd: parentNode.snd,
                pos: newPos,
                direction: parentNode.direction,
            };
            return replaceNode(nudgedParent_1, parentId.replace("root", ""), newParent);
        }
        var x = 1;
        if (absolute) {
            // console.log("Performing pos move for nudge on:", parentId);
            // console.log(`Trying to move the line ${bias}% of root.`);
            var parentSize = getAbsoluteSizeOfNode(root, parentId, direction);
            // console.log("Parent size is:", parentSize);
            var rootSize = 100;
            // console.log("Root size is:", rootSize);
            x = rootSize / parentSize;
        }
        var newSplitParent = {
            fst: parentNode.fst,
            snd: parentNode.snd,
            pos: Math.max(0, Math.min(100, parentNode.pos + bias * x)),
            direction: parentNode.direction,
        };
        return replaceNode(root, parentId.replace("root", ""), newSplitParent);
    }
    // console.log(
    //   "nudging cell in wrong direction -- nudging first available parent"
    // );
    return nudge(root, parentId, direction, bias, absolute);
};
var getAbsoluteSizeOfNode = function (rootNode, id, direction) {
    // the output is 0-100 representing percent size of root, who's size never changes
    if (id.replace("root", "") === "") {
        return 100;
    }
    var ancestorId = id.slice(0, id.length - 1);
    var ancestorNode = getBNodeByKey(rootNode, ancestorId.replace("root", ""));
    if (ancestorNode.direction !== direction) {
        return getAbsoluteSizeOfNode(rootNode, ancestorId, direction);
    }
    if (id
        .replace("root", "")
        .replace(ancestorId.replace("root", ""), "")
        .charAt(0) === "0") {
        return ((ancestorNode.pos / 100) *
            getAbsoluteSizeOfNode(rootNode, ancestorId, direction));
    }
    else {
        return (((100 - ancestorNode.pos) / 100) *
            getAbsoluteSizeOfNode(rootNode, ancestorId, direction));
    }
};
var getAbsoluteOffsetOfNode = function (rootNode, id, direction) {
    // the output is 0-100 representing percent size of root, who's size never changes
    if (id.replace("root", "") === "") {
        return 0;
    }
    var ancestorId = id.slice(0, id.length - 1);
    var ancestorNode = getBNodeByKey(rootNode, ancestorId.replace("root", ""));
    if (ancestorNode.direction !== direction) {
        return 0 + getAbsoluteOffsetOfNode(rootNode, ancestorId, direction);
    }
    if (id
        .replace("root", "")
        .replace(ancestorId.replace("root", ""), "")
        .charAt(0) === "0") {
        return 0 + getAbsoluteOffsetOfNode(rootNode, ancestorId, direction);
    }
    else {
        return ((ancestorNode.pos / 100) *
            getAbsoluteSizeOfNode(rootNode, ancestorId, direction) +
            getAbsoluteOffsetOfNode(rootNode, ancestorId, direction));
    }
};
var rotateSplit = function (rootNode, id) {
    var parentId = id.substring(0, id.length - 1);
    var parent = getBNodeByKey(rootNode, parentId.replace("root", ""));
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(parent))
        throw Error("Trying to grow something that has `content` as a parent!");
    var newParent = {
        fst: parent.fst,
        snd: parent.snd,
        pos: parent.pos,
        direction: parent.direction === "vertical" ? "horizontal" : "vertical",
    };
    return replaceNode(rootNode, parentId.replace("root", ""), newParent);
};
var adjustSplitSize = function (rootNode, id, delta) {
    var parentId = id.substring(0, id.length - 1);
    console.log(parentId);
    var parent = getBNodeByKey(rootNode, parentId.replace("root", ""));
    console.log(parent);
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(parent))
        throw Error("Trying to grow something that has `content` as a parent!");
    var newParent = {
        fst: parent.fst,
        snd: parent.snd,
        pos: parent.pos + delta,
        direction: parent.direction,
    };
    return replaceNode(rootNode, parentId.replace("root", ""), newParent);
};
var getFocusUp = function (nodeState, currFocus) {
    var getFirstNodeUp = function (currFocus, history) {
        var _a, _b;
        var parentId = currFocus.substring(0, currFocus.length - 1);
        var parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
        // console.log("PARENT IS", parentId);
        if (parentId === "") {
            return [currFocus, history];
        }
        var nextFocus = null;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(parent)) {
            if (parent.direction === "vertical") {
                if (currFocus.charAt(currFocus.length - 1) === "1") {
                    // MOVING FROM LOWER SPLIT
                    nextFocus = parentId + "0";
                }
                else {
                    // MOVING FROM UPPER SPLIT
                    _a = getFirstNodeUp(parentId, history), nextFocus = _a[0], history = _a[1];
                }
            }
            else if (parent.direction === "horizontal") {
                _b = getFirstNodeUp(parentId, history.concat([currFocus.charAt(currFocus.length - 1)])), nextFocus = _b[0], history = _b[1];
            }
        }
        return [nextFocus, history];
    };
    var _a = getFirstNodeUp(currFocus, []), nextFocus = _a[0], history = _a[1];
    if (!nextFocus)
        return null;
    var getBottomMost = function (n, horizontalPrefs) {
        var currNode = getBNodeByKey(nodeState, n.replace("root", ""));
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(currNode))
            return n;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(currNode)) {
            if (currNode.direction === "horizontal") {
                if (horizontalPrefs.length > 0)
                    return getBottomMost(n + horizontalPrefs.pop(), horizontalPrefs);
                return getBottomMost(n + "0", []); // if uncertain go to first
            }
            else {
                return getBottomMost(n + "1", horizontalPrefs);
            }
        }
    };
    return getBottomMost(nextFocus, history);
};
var getFocusDown = function (nodeState, currFocus) {
    var getFirstNodeDown = function (currFocus, history) {
        var _a, _b;
        var parentId = currFocus.substring(0, currFocus.length - 1);
        var parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
        if (parentId === "") {
            return [currFocus, history];
        }
        var nextFocus = null;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(parent)) {
            if (parent.direction === "vertical") {
                if (currFocus.charAt(currFocus.length - 1) === "0") {
                    // MOVING FROM UPPER SPLIT
                    nextFocus = parentId + "1";
                }
                else {
                    // MOVING FROM LOWER SPLIT
                    _a = getFirstNodeDown(parentId, history), nextFocus = _a[0], history = _a[1];
                }
            }
            else if (parent.direction === "horizontal") {
                _b = getFirstNodeDown(parentId, history.concat([currFocus.charAt(currFocus.length - 1)])), nextFocus = _b[0], history = _b[1];
            }
        }
        return [nextFocus, history];
    };
    var _a = getFirstNodeDown(currFocus, []), nextFocus = _a[0], history = _a[1];
    if (!nextFocus)
        return null;
    var getTopMost = function (n, horizontalPrefs) {
        var currNode = getBNodeByKey(nodeState, n.replace("root", ""));
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(currNode))
            return n;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(currNode)) {
            if (currNode.direction === "horizontal") {
                if (horizontalPrefs.length > 0)
                    return getTopMost(n + horizontalPrefs.pop(), horizontalPrefs);
                return getTopMost(n + "0", []); // if uncertain go to first
            }
            else {
                return getTopMost(n + "0", horizontalPrefs);
            }
        }
    };
    return getTopMost(nextFocus, history);
};
var getFocusRight = function (nodeState, currFocus) {
    var getFirstNodeRight = function (currFocus, history) {
        var _a, _b;
        var parentId = currFocus.substring(0, currFocus.length - 1);
        var parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
        if (parentId === "") {
            return [currFocus, history];
        }
        var nextFocus = null;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(parent)) {
            if (parent.direction === "horizontal") {
                if (currFocus.charAt(currFocus.length - 1) === "0") {
                    // MOVING FROM LEFT SPLIT
                    nextFocus = parentId + "1";
                }
                else {
                    // MOVING FROM RIGHT SPLIT
                    _a = getFirstNodeRight(parentId, history), nextFocus = _a[0], history = _a[1];
                }
            }
            else if (parent.direction === "vertical") {
                _b = getFirstNodeRight(parentId, history.concat([currFocus.charAt(currFocus.length - 1)])), nextFocus = _b[0], history = _b[1];
            }
        }
        return [nextFocus, history];
    };
    var _a = getFirstNodeRight(currFocus, []), nextFocus = _a[0], history = _a[1];
    if (!nextFocus)
        return null;
    var getLeftMost = function (n, horizontalPrefs) {
        var currNode = getBNodeByKey(nodeState, n.replace("root", ""));
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(currNode))
            return n;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(currNode)) {
            if (currNode.direction === "vertical") {
                if (horizontalPrefs.length > 0)
                    return getLeftMost(n + horizontalPrefs.pop(), horizontalPrefs);
                return getLeftMost(n + "0", []); // if uncertain go to first
            }
            else {
                return getLeftMost(n + "0", horizontalPrefs);
            }
        }
    };
    return getLeftMost(nextFocus, history);
};
var getFocusLeft = function (nodeState, currFocus) {
    var getFirstNodeLeft = function (currFocus, history) {
        var _a, _b;
        var parentId = currFocus.substring(0, currFocus.length - 1);
        var parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
        if (parentId === "") {
            return [currFocus, history];
        }
        var nextFocus = null;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(parent)) {
            if (parent.direction === "horizontal") {
                if (currFocus.charAt(currFocus.length - 1) === "1") {
                    // MOVING FROM RIGHT SPLIT
                    nextFocus = parentId + "0";
                }
                else {
                    // MOVING FROM LEFT SPLIT
                    _a = getFirstNodeLeft(parentId, history), nextFocus = _a[0], history = _a[1];
                }
            }
            else if (parent.direction === "vertical") {
                _b = getFirstNodeLeft(parentId, history.concat([currFocus.charAt(currFocus.length - 1)])), nextFocus = _b[0], history = _b[1];
            }
        }
        return [nextFocus, history];
    };
    var _a = getFirstNodeLeft(currFocus, []), nextFocus = _a[0], history = _a[1];
    if (!nextFocus)
        return null;
    var getRightMost = function (n, horizontalPrefs) {
        var currNode = getBNodeByKey(nodeState, n.replace("root", ""));
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(currNode))
            return n;
        if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(currNode)) {
            if (currNode.direction === "vertical") {
                if (horizontalPrefs.length > 0)
                    return getRightMost(n + horizontalPrefs.pop(), horizontalPrefs);
                return getRightMost(n + "0", []); // if uncertain go to first
            }
            else {
                return getRightMost(n + "1", horizontalPrefs);
            }
        }
    };
    return getRightMost(nextFocus, history);
};
var treeEq = function (nodeA, nodeB) {
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(nodeA) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(nodeB)) {
        return nodeA === nodeB;
    }
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(nodeA) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(nodeB)) {
        return (nodeA.pos === nodeB.pos &&
            treeEq(nodeA.fst, nodeB.fst) &&
            treeEq(nodeA.snd, nodeB.snd));
    }
    return false;
};
var treeDiff = function (nodeA, nodeB, rootId) {
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(nodeA) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(nodeB)) {
        return [];
    }
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(nodeA) && (0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(nodeB)) {
        var diffs = [];
        if (nodeA.pos !== nodeB.pos) {
            diffs.push({
                editType: "changePos",
                data: nodeB.pos,
                nodeId: rootId,
                direction: nodeB.direction,
            });
        }
        diffs = diffs.concat(treeDiff(nodeA.fst, nodeB.fst, rootId + "0"));
        diffs = diffs.concat(treeDiff(nodeA.snd, nodeB.snd, rootId + "1"));
        return diffs;
    }
    console.warn("I HAVENT THOUGHT THIS CODE THROUGH!!!");
    return [
        {
            editType: "replace",
            data: nodeB,
            direction: "?",
            nodeId: rootId,
        },
    ];
};


/***/ }),

/***/ "./src/btreelayout.ts":
/*!****************************!*\
  !*** ./src/btreelayout.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getState": () => (/* binding */ getState)
/* harmony export */ });
/* harmony import */ var _rendering__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rendering */ "./src/rendering.ts");
/* harmony import */ var _btree_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./btree_utils */ "./src/btree_utils.ts");


// RENDERING
document.addEventListener("touchmove", function (e) {
    e.preventDefault();
}, { passive: false });
// INIT
var initTree = {
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
            snd: document.createElement("textarea"),
            pos: 50,
            direction: "horizontal",
        },
        pos: 50,
        direction: "vertical",
    },
    pos: 25,
    direction: "horizontal",
};
var state = null;
var getState = function () {
    return state;
};
var updateState = function (newState) {
    if (state &&
        JSON.stringify(state.selected) === JSON.stringify(newState.selected) &&
        (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.treeEq)(state.tree, newState.tree)) {
        console.log("No change -- skipping render!");
    }
    else {
        console.log(state);
        // render(document.body, newState, updateState);
        if (state) {
            console.log(state.tree);
            var diffs = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.treeDiff)(state.tree, newState.tree, "root");
            console.log(diffs);
            (0,_rendering__WEBPACK_IMPORTED_MODULE_0__.renderDiffs)(diffs);
        }
        state = newState;
    }
};
(0,_rendering__WEBPACK_IMPORTED_MODULE_0__.render)(document.body, {
    selected: [],
    tree: initTree,
}, updateState);
updateState({
    selected: [],
    tree: initTree,
});


/***/ }),

/***/ "./src/rendering.ts":
/*!**************************!*\
  !*** ./src/rendering.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "renderDiffs": () => (/* binding */ renderDiffs)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/types.ts");
/* harmony import */ var _btree_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./btree_utils */ "./src/btree_utils.ts");
/* harmony import */ var _btreelayout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./btreelayout */ "./src/btreelayout.ts");



var PADDING_SIZE = 0;
var splitToHTML = function (split, id, focusedIds, handlers) {
    var container = document.createElement("div");
    container.id = id;
    container.classList.add("container", split.direction);
    var fstChild = document.createElement("div");
    fstChild.appendChild(bNodeToHTML(split.fst, id + "0", focusedIds, handlers));
    fstChild.classList.add("fst");
    fstChild.style[split.direction === "horizontal" ? "width" : "height"] = "calc(" + split.pos + "% - " + 2 * PADDING_SIZE + "px)";
    var sndChild = document.createElement("div");
    sndChild.appendChild(bNodeToHTML(split.snd, id + "1", focusedIds, handlers));
    sndChild.classList.add("snd");
    container.append(fstChild, sndChild);
    container.onclick = handlers.onClick;
    return container;
};
var bNodeToHTML = function (node, id, focusedIds, handlers) {
    focusedIds = focusedIds ? focusedIds : [];
    id = id ? id : "root";
    var result = null;
    if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isSplit)(node)) {
        result = splitToHTML(node, id, focusedIds, handlers);
    }
    else if ((0,_types__WEBPACK_IMPORTED_MODULE_0__.isContent)(node)) {
        var contentWrapper = document.createElement("div");
        contentWrapper.classList.add("content");
        contentWrapper.id = id;
        var tempdiv = document.createElement("div");
        tempdiv.appendChild(document.createTextNode(id));
        contentWrapper.ontouchstart = function (e) {
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
var mouseState = null;
var render = function (root, state, updateState) {
    console.log("rendering....");
    root.innerHTML = "";
    var handleClick = function (e) {
        var state = (0,_btreelayout__WEBPACK_IMPORTED_MODULE_2__.getState)();
        if (state === null)
            return;
        var id = e.target.id;
        id = id.substring(id.indexOf("."));
        var newState = {
            tree: state.tree,
            selected: [id],
        };
        updateState(newState);
    };
    document.onkeydown = function (evt) {
        var state = (0,_btreelayout__WEBPACK_IMPORTED_MODULE_2__.getState)();
        if (state === null)
            return;
        var n = null;
        var newState = state.tree;
        if (evt.shiftKey) {
            if (evt.key === "ArrowUp") {
                newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newState, state.selected[0], "vertical", -5, true);
            }
            if (evt.key === "ArrowDown") {
                newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newState, state.selected[0], "vertical", 5, true);
            }
            if (evt.key === "ArrowRight") {
                newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newState, state.selected[0], "horizontal", 5, true);
            }
            if (evt.key === "ArrowLeft") {
                newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newState, state.selected[0], "horizontal", -5, true);
            }
        }
        else {
            if (evt.key === "ArrowUp") {
                n = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusUp)(newState, state.selected[0]);
            }
            if (evt.key === "ArrowDown") {
                n = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusDown)(newState, state.selected[0]);
            }
            if (evt.key === "ArrowRight") {
                n = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusRight)(newState, state.selected[0]);
            }
            if (evt.key === "ArrowLeft") {
                n = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusLeft)(newState, state.selected[0]);
            }
        }
        if (evt.key === "Enter") {
            newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.insertSplit)(newState, state.selected[0]);
            n = state.selected + "0";
        }
        if (evt.key === "Backspace") {
            newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.deleteNode)(newState, state.selected[0]);
        }
        if (evt.key === "+") {
            var lastChar = state.selected[0].charAt(state.selected[0].length - 1);
            newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.adjustSplitSize)(newState, state.selected[0], 5 * (lastChar === "0" ? 1 : -1));
        }
        if (evt.key === "-") {
            var lastChar = state.selected[0].charAt(state.selected[0].length - 1);
            newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.adjustSplitSize)(newState, state.selected[0], -5 * (lastChar === "0" ? 1 : -1));
        }
        if (evt.key === "r") {
            newState = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.rotateSplit)(newState, state.selected[0]);
        }
        updateState({
            tree: newState,
            selected: n ? [n] : state.selected,
        });
    };
    var handleCursorDown = function (x, y, id) {
        var state = (0,_btreelayout__WEBPACK_IMPORTED_MODULE_2__.getState)();
        if (state === null)
            return;
        var width = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getAbsoluteSizeOfNode)(state.tree, id, "horizontal");
        var height = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getAbsoluteSizeOfNode)(state.tree, id, "vertical");
        var xoffset = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getAbsoluteOffsetOfNode)(state.tree, id, "horizontal");
        var yoffset = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getAbsoluteOffsetOfNode)(state.tree, id, "vertical");
        var relativeX = (x - xoffset) / width;
        var relativeY = (y - yoffset) / height;
        var horizontalHandle = null;
        var verticalHandle = null;
        if (relativeX > 0.5) {
            horizontalHandle = "right";
        }
        else if (relativeX < 0.5) {
            horizontalHandle = "left";
        }
        if (relativeY > 0.5) {
            verticalHandle = "bottom";
        }
        else if (relativeY < 0.5) {
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
    var handleCursorMove = function (e) {
        var state = (0,_btreelayout__WEBPACK_IMPORTED_MODULE_2__.getState)();
        // console.log('?')
        // if (state === null) return;
        var id = e.target.id;
        id = id.substring(id.indexOf("."));
        var rootNode = document.getElementById("root");
        var bounds = rootNode.getBoundingClientRect();
        var x = null;
        var y = null;
        if ("touches" in e) {
            x = (100 * e.touches[0].clientX) / bounds.right;
            y = (100 * e.touches[0].clientY) / bounds.bottom;
        }
        else {
            x = (100 * e.clientX) / bounds.right;
            y = (100 * e.clientY) / bounds.bottom;
        }
        if (mouseState) {
            var dx = x - mouseState.initX;
            var dy = y - mouseState.initY;
            var id_1 = mouseState.selected;
            var newTree = state.tree;
            if ((dx > 0 && mouseState.horizontalHandle === "right") ||
                (dx < 0 && mouseState.horizontalHandle === "left")) {
                newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(state.tree, id_1, "horizontal", dx, true);
            }
            else if (dx < 0 && mouseState.horizontalHandle === "right") {
                var neighbor = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusRight)(state.tree, id_1);
                if (neighbor)
                    newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(state.tree, neighbor, "horizontal", dx, true);
            }
            else if (dx > 0 && mouseState.horizontalHandle === "left") {
                var neighbor = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusLeft)(state.tree, id_1);
                if (neighbor)
                    newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(state.tree, neighbor, "horizontal", dx, true);
            }
            if ((dy < 0 && mouseState.verticalHandle === "top") ||
                (dy > 0 && mouseState.verticalHandle === "bottom")) {
                newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newTree, id_1, "vertical", dy, true);
            }
            else if (dy > 0 && mouseState.verticalHandle === "top") {
                var neighbor = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusUp)(state.tree, id_1);
                if (neighbor)
                    newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newTree, neighbor, "vertical", dy, true);
            }
            else if (dy < 0 && mouseState.verticalHandle === "bottom") {
                var neighbor = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.getFocusDown)(state.tree, id_1);
                if (neighbor)
                    newTree = (0,_btree_utils__WEBPACK_IMPORTED_MODULE_1__.nudge)(newTree, neighbor, "vertical", dy, true);
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
    root.onmouseup = function (e) {
        mouseState = null;
    };
    root.appendChild(bNodeToHTML(state.tree, "root", state.selected, {
        onClick: handleClick,
        onMouseDown: function (e) {
            var id = e.target.id;
            id = id.substring(id.indexOf("."));
            var rootNode = document.getElementById("root");
            var bounds = rootNode.getBoundingClientRect();
            var x = null;
            var y = null;
            if ("touches" in e) {
                x = (100 * e.touches[0].clientX) / bounds.right;
                y = (100 * e.touches[0].clientY) / bounds.bottom;
            }
            else {
                x = (100 * e.clientX) / bounds.right;
                y = (100 * e.clientY) / bounds.bottom;
            }
            handleCursorDown(x, y, id);
        },
        onMouseMove: handleCursorMove,
    }));
};
var renderDiffs = function (diffs) {
    console.log("rendering diffs...");
    //   console.log(getState());
    diffs.forEach(function (diff) {
        console.log(diff);
        if (diff.editType === "changePos") {
            console.log(diff.direction);
            var currDomElem = document.getElementById(diff.nodeId).children[0];
            if (diff.direction === "vertical") {
                currDomElem.style.height = diff.data + "%";
            }
            else {
                currDomElem.style.width = diff.data + "%";
            }
        }
    });
};


/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isSplit": () => (/* binding */ isSplit),
/* harmony export */   "isContent": () => (/* binding */ isContent),
/* harmony export */   "isBNode": () => (/* binding */ isBNode)
/* harmony export */ });
var isSplit = function (n) {
    return (n &&
        "fst" in n &&
        isBNode(n.fst) &&
        "snd" in n &&
        isBNode(n.snd) &&
        "pos" in n);
};
var isContent = function (n) {
    return n instanceof HTMLElement || n instanceof Text;
};
var isBNode = function (n) {
    return isContent(n) || isSplit(n);
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/btreelayout.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map