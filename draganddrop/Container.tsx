import * as React from "react";
import { useDrop } from "react-dnd";
import { Item, ItemProps } from "./Item";

export const SingleContainer = (props: {
  value?: string;
  accepts: string[];
  color?: (val: string) => string;
  onChange?: (newVal: string) => void;
}) => {
  //   const [collectedProps, drop] = useDrop(() => ({
  //     accept: ["Box"],
  //   }));

  const [value, setValue] = React.useState<string>(props.value);
  const [type, setType] = React.useState<ItemProps["type"]>(null);

  const handleDrop = React.useCallback(({ value, type }) => {
    setType(type);
    setValue(value);
    if (props.onChange) props.onChange(value);
  }, []);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: props.accepts,
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  console.log(type);

  return (
    <span
      style={{
        minHeight: 30,
        minWidth: 150,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        // padding: 3,
        margin: 3,
        border: "dashed 1px gray",
        borderRadius: 3,
      }}
      ref={drop}
    >
      {value ? (
        <Item
          value={value}
          color={props.color ? props.color(type) : "gray"}
          type={type ? type : "user"}
          isDropped={false}
        />
      ) : null}
    </span>
  );
};
