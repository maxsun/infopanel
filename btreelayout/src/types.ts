export interface Split {
  fst: BNode;
  snd: BNode;
  pos: number; // 0-100 representing split percentage taken by fst
  direction: "vertical" | "horizontal";
}

export interface Handle {
  nodeId: string;
  handle: string;
  initX: number;
  initY: number;
}

export const isSplit = (n: any): n is Split => {
  return (
    n &&
    "fst" in n &&
    isBNode(n.fst) &&
    "snd" in n &&
    isBNode(n.snd) &&
    "pos" in n
  );
};

export type Content = HTMLElement | Text;
export const isContent = (n: any): n is Content => {
  return n instanceof HTMLElement || n instanceof Text;
};

export type BNode = Split | Content;
export const isBNode = (n: any): n is BNode => {
  return isContent(n) || isSplit(n);
};

export interface BTreeUserState {
  tree: BNode;
  selected: string[];
}
