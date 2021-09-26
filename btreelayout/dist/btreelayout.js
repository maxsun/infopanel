"use strict";
// TYPES
var BORDER_WIDTH = 5;
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
// RENDERING
var splitToHTML = function (split, id, focusedIds) {
    var container = document.createElement("div");
    container.id = id;
    container.classList.add("container", split.direction);
    var fstChild = bNodeToHTML(split.fst, id + "0", focusedIds);
    fstChild.classList.add("fst");
    fstChild.style[split.direction === "horizontal" ? "width" : "height"] = "calc(" + split.pos + "% - " + 2 * BORDER_WIDTH + "px)";
    var sndChild = bNodeToHTML(split.snd, id + "1", focusedIds);
    sndChild.classList.add("snd");
    container.append(fstChild, sndChild);
    container.onclick = function (evt) {
        var t = evt.target;
        if (true) {
            var newFocus = [t.id];
            var selectedNode = getBNodeByKey(STATE, t.id.replace("root", ""));
            console.log("selected:", t.id, selectedNode);
            evt.stopPropagation();
            render(document.body, STATE, newFocus);
        }
    };
    document.onkeydown = function (evt) {
        var newFocus = [];
        var n = null;
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
        }
        else {
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
            var lastChar = focusedIds[0].charAt(focusedIds[0].length - 1);
            STATE = adjustSplitSize(STATE, focusedIds[0], 5 * (lastChar === "0" ? 1 : -1));
        }
        if (evt.key === "-") {
            var lastChar = focusedIds[0].charAt(focusedIds[0].length - 1);
            STATE = adjustSplitSize(STATE, focusedIds[0], -5 * (lastChar === "0" ? 1 : -1));
        }
        if (evt.key === "r") {
            STATE = rotateSplit(STATE, focusedIds[0]);
        }
        newFocus.push(n !== null ? n : focusedIds[0]);
        render(document.body, STATE, newFocus);
    };
    return container;
};
var bNodeToHTML = function (node, id, focusedIds) {
    focusedIds = focusedIds ? focusedIds : [];
    id = id ? id : "root";
    // const nodeElem = document.createElement("div");
    // nodeElem.classList.add("node");
    var result = null;
    if (isSplit(node)) {
        result = splitToHTML(node, id, focusedIds);
    }
    else if (isContent(node)) {
        var contentWrapper = document.createElement("div");
        contentWrapper.classList.add("content");
        contentWrapper.id = id;
        var tempdiv = document.createElement("div");
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
var render = function (root, node, focusedIds) {
    root.innerHTML = "";
    root.appendChild(bNodeToHTML(node, "root", focusedIds));
};
// UTILS
var getBNodeByKey = function (rootNode, id) {
    if (id === "")
        return rootNode;
    if (isContent(rootNode))
        return null;
    if (isSplit(rootNode)) {
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
    if (isContent(original))
        return original;
    if (isSplit(original)) {
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
var nudge = function (root, id, direction, bias) {
    console.log("Nudging " + id + " " + direction + " " + bias);
    if (id.replace("root", "") === "") {
        console.log("Tried to nudge, but nowhere to go");
        return root;
    }
    var parentId = id.substring(0, id.length - 1);
    var parentNode = getBNodeByKey(root, parentId.replace("root", ""));
    if (isContent(parentNode)) {
        throw Error("parent is somehow content");
    }
    if (parentNode.direction === direction) {
        // the split is compatible with the direction we want to nudge
        var lastchr = id.charAt(id.length - 1);
        // check if moving against edge of parent split. if so, nudge parent
        if ((bias > 0 && lastchr === "1") || (bias < 0 && lastchr == "0")) {
            console.log("Trying to move " + direction + ", but cant. Will nudge parent.");
            var nudgedParent = nudge(root, parentId, direction, bias);
            console.log("Nudged parent:", nudgedParent, "now have to normalize children");
            var getIdOfHighestChange_1 = function (node1, node2, id) {
                console.log("Comparing", node1, node2);
                if (isContent(node1) && isContent(node2) && node1 !== node2) {
                    return id;
                }
                if (isSplit(node1) && isSplit(node2)) {
                    if (node1.pos !== node2.pos) {
                        console.log("found it!");
                        return id;
                    }
                    else {
                        return [
                            getIdOfHighestChange_1(node1.fst, node2.fst, id + "0"),
                            getIdOfHighestChange_1(node1.snd, node2.snd, id + "1"),
                        ].sort(function (a, b) { return (a.length < b.length ? 1 : -1); })[0];
                    }
                }
            };
            var z = getIdOfHighestChange_1(root, nudgedParent, "");
            var gp = getBNodeByKey(root, z);
            var nudgedGp = getBNodeByKey(nudgedParent, z);
            console.log(">>", gp);
            console.log(">?>", nudgedGp);
            var opos = gp.pos;
            if (id.charAt(id.length - 1) === "0")
                opos = 100 - opos;
            var npos = nudgedGp.pos;
            if (id.charAt(id.length - 1) === "0")
                npos = 100 - npos;
            var q = (npos - opos) / opos;
            // q = q * 1.05;
            // q = -q * 0.95;
            console.log(">", opos, npos, q);
            if (opos === undefined) {
                return nudgedParent;
            }
            // after nudging, the parent's width will have increased by:
            // 5%
            var newParent = {
                fst: parentNode.fst,
                snd: parentNode.snd,
                pos: id.charAt(id.length - 1) === "0"
                    ? 100 - (100 - parentNode.pos) / (1 + q)
                    : parentNode.pos / (1 + q),
                // pos: parentNode.pos,
                direction: parentNode.direction,
            };
            return replaceNode(nudgedParent, parentId.replace("root", ""), newParent);
        }
        var newSplitParent = {
            fst: parentNode.fst,
            snd: parentNode.snd,
            pos: parentNode.pos + bias * 5,
            direction: parentNode.direction,
        };
        return replaceNode(root, parentId.replace("root", ""), newSplitParent);
    }
    console.log("nudging cell in wrong direction -- nudging first available parent");
    return nudge(root, parentId, direction, bias);
};
var rotateSplit = function (rootNode, id) {
    var parentId = id.substring(0, id.length - 1);
    var parent = getBNodeByKey(rootNode, parentId.replace("root", ""));
    if (isContent(parent))
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
    if (isContent(parent))
        throw Error("Trying to grow something that has `content` as a parent!");
    var newParent = {
        fst: parent.fst,
        snd: parent.snd,
        pos: parent.pos + delta,
        direction: parent.direction,
    };
    return replaceNode(rootNode, parentId.replace("root", ""), newParent);
    // return parent;
};
var getFocusUp = function (nodeState, currFocus) {
    var getFirstNodeUp = function (currFocus, history) {
        var _a, _b;
        var parentId = currFocus.substring(0, currFocus.length - 1);
        var parent = getBNodeByKey(nodeState, parentId.replace("root", ""));
        var nextFocus = null;
        if (isSplit(parent)) {
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
        var currNode = getBNodeByKey(STATE, n.replace("root", ""));
        if (isContent(currNode))
            return n;
        if (isSplit(currNode)) {
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
        var nextFocus = null;
        if (isSplit(parent)) {
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
        var currNode = getBNodeByKey(STATE, n.replace("root", ""));
        if (isContent(currNode))
            return n;
        if (isSplit(currNode)) {
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
        var nextFocus = null;
        if (isSplit(parent)) {
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
        var currNode = getBNodeByKey(STATE, n.replace("root", ""));
        if (isContent(currNode))
            return n;
        if (isSplit(currNode)) {
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
        var nextFocus = null;
        if (isSplit(parent)) {
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
        var currNode = getBNodeByKey(STATE, n.replace("root", ""));
        if (isContent(currNode))
            return n;
        if (isSplit(currNode)) {
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
// INIT
var img = document.createElement("img");
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
var STATE = {
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
