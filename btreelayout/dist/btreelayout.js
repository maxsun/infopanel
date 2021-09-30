"use strict";
// TYPES
var PADDING_SIZE = 0;
var selectedHandle = null;
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
    var fstChild = document.createElement("div");
    fstChild.appendChild(bNodeToHTML(split.fst, id + "0", focusedIds));
    fstChild.classList.add("fst");
    // fstChild.style[
    //   split.direction === "horizontal" ? "width" : "height"
    // ] = `calc(${split.pos}%`;
    fstChild.style[split.direction === "horizontal" ? "width" : "height"] = "calc(" + split.pos + "% - " + 2 * PADDING_SIZE + "px)";
    var sndChild = document.createElement("div");
    sndChild.appendChild(bNodeToHTML(split.snd, id + "1", focusedIds));
    sndChild.classList.add("snd");
    container.append(fstChild, sndChild);
    container.onclick = function (evt) {
        var t = evt.target;
        if (true) {
            var newFocus = [t.id];
            var selectedNode = getBNodeByKey(STATE, t.id.replace("root", ""));
            console.log("selected:", t.id, selectedNode);
            // evt.stopPropagation();
            render(document.body, STATE, newFocus);
        }
    };
    document.onkeydown = function (evt) {
        var newFocus = [];
        var n = null;
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
            n = focusedIds + "0";
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
        var makeHandle = function (classname) {
            var handle = document.createElement("div");
            handle.classList.add(classname, "handle");
            handle.onmousedown = function (e) {
                console.log("Handle Clicked for", id);
                selectedHandle = {
                    nodeId: id,
                    handle: classname,
                    initX: e.clientX,
                    initY: e.clientY,
                };
                e.stopPropagation();
            };
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
document.onmousemove = function (e) {
    // console.log(selectedHandle);
};
document.onmouseup = function (e) {
    if (selectedHandle) {
        console.log(selectedHandle);
        var diffX = ((e.clientX - selectedHandle.initX) / window.innerWidth) * 100;
        var diffY = ((e.clientY - selectedHandle.initY) / window.innerHeight) * 100;
        console.log(diffX, diffY);
        // horizontal move
        if (selectedHandle.handle === "topleft") {
            if (diffX > 0) {
                var leftId = getFocusLeft(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, leftId, "horizontal", diffX, true);
            }
            else {
                STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
            }
            //vertical move
            if (diffY < 0) {
                STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
            }
            else {
                var upperId = getFocusUp(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, upperId, "vertical", diffY, true);
            }
            // render(document.body, STATE, []);
        }
        else if (selectedHandle.handle === "topright") {
            // top right handle
            if (diffX < 0) {
                var leftId = getFocusRight(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, leftId, "horizontal", diffX, true);
            }
            else {
                STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
            }
            //vertical move
            if (diffY < 0) {
                STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
            }
            else {
                var upperId = getFocusUp(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, upperId, "vertical", diffY, true);
            }
        }
        else if (selectedHandle.handle === "bottomleft") {
            if (diffX > 0) {
                var leftId = getFocusLeft(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, leftId, "horizontal", diffX, true);
            }
            else {
                STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
            }
            if (diffY > 0) {
                STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
            }
            else {
                var upperId = getFocusDown(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, upperId, "vertical", diffY, true);
            }
        }
        else if (selectedHandle.handle === "bottomright") {
            if (diffX < 0) {
                var leftId = getFocusRight(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, leftId, "horizontal", diffX, true);
            }
            else {
                STATE = nudge(STATE, selectedHandle.nodeId, "horizontal", diffX, true);
            }
            if (diffY > 0) {
                STATE = nudge(STATE, selectedHandle.nodeId, "vertical", diffY, true);
            }
            else {
                var upperId = getFocusDown(STATE, selectedHandle.nodeId.replace("root", ""));
                STATE = nudge(STATE, upperId, "vertical", diffY, true);
            }
        }
        else {
            throw Error("Trying to move unknown type of handle");
        }
    }
    selectedHandle = null;
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
var nudge = function (root, id, direction, bias, absolute) {
    console.log("Nudging " + id + " " + direction + " " + bias);
    absolute = absolute ? absolute : false;
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
            var nudgedParent_1 = nudge(root, parentId, direction, bias, absolute);
            console.log("Nudged parent:", nudgedParent_1, "now have to normalize children");
            var getChangedIds_1 = function (node1, node2, id) {
                if ((isContent(node1) && isSplit(node2)) ||
                    (isSplit(node1) && isContent(node2))) {
                    throw Error("comparison is off somehoow");
                }
                if (isSplit(node1) && isSplit(node2)) {
                    var changedFst = getChangedIds_1(node1.fst, node2.fst, id + "0");
                    var changedSnd = getChangedIds_1(node1.snd, node2.snd, id + "1");
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
            console.log("up-tree changes (while nudging " + id + "):", changes_1);
            changedIds = Object.keys(changes_1).sort(function (a, b) {
                return a.length < b.length ? -1 : 1;
            });
            var oldSize = getAbsoluteSizeOfNode(root, parentId, direction);
            var newSize = getAbsoluteSizeOfNode(nudgedParent_1, parentId, direction);
            var oldOffset = getAbsoluteOffsetOfNode(root, parentId, direction);
            var newOffset = getAbsoluteOffsetOfNode(nudgedParent_1, parentId, direction);
            var parentOffset = getAbsoluteOffsetOfNode(nudgedParent_1, parentId, direction);
            console.log("Parent (" + parentId + ") offset: " + oldOffset + " => " + newOffset);
            var o = oldOffset + oldSize * (parentNode.pos / 100);
            console.log("We want to keep the split pos at " + o);
            console.log("If we set the pos to 0, it would be at " + parentOffset);
            console.log("If we set the pos to 100, it would be at " + (parentOffset + newSize));
            // If we set the pos to x, its abs position is: parentOffset + (x / 100) * newSize
            var newPos = ((o - parentOffset) / newSize) * 100;
            console.log("New pos is:", newPos);
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
            console.log("Performing pos move for nudge on:", parentId);
            console.log("Trying to move the line " + bias + "% of root.");
            var parentSize = getAbsoluteSizeOfNode(root, parentId, direction);
            console.log("Parent size is:", parentSize);
            var rootSize = 100;
            console.log("Root size is:", rootSize);
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
    console.log("nudging cell in wrong direction -- nudging first available parent");
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
        console.log("PARENT IS", parentId);
        if (parentId === "") {
            return [currFocus, history];
        }
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
var STATE = {
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
