import * as React from "react";
import { useDrop } from "react-dnd";
import { Item } from "./Item";
import { SingleContainer } from "./Container";

export const Pane = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Item value={"hello"} type={"survey"} isDropped={false} />
      <Item value={"something else"} type={"user"} isDropped={false} />
    </div>
  );
};
