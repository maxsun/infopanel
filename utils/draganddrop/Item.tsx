import * as React from "react";
import { CSSProperties, FC, memo } from "react";
import { useDrag } from "react-dnd";

export interface ItemProps {
  value: any;
  label: string;
  type: "org" | "survey" | "user" | "action" | "roletype";
  isDropped: boolean;
  color?: string;
  icon?: React.ReactElement;
}

export const Item: FC<ItemProps> = memo(function Item({
  value,
  label,
  type,
  color,
  icon,
  isDropped,
}) {
  const style: CSSProperties = {
    // border: "1px dashed gray",
    borderRadius: 3,
    backgroundColor: color ? color : "none",
    padding: "0.5rem 1rem",
    // marginRight: "1.5rem",
    // marginBottom: "1.5rem",
    margin: ".5rem",
    cursor: "move",
    float: "left",
  };

  const [{ opacity }, drag] = useDrag(
    () => ({
      type,
      item: { value, label, type },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [value, label, type]
  );

  return (
    <div ref={drag} role="Box" style={{ ...style, opacity }}>
      {icon ? icon : null}
      {label}
    </div>
  );
});
