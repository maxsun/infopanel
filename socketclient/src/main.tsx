import * as React from "react";
import * as ReactDOM from "react-dom";

console.log("running...");

interface IMsg {
  text: string;
  received: boolean;
}

const Message = (props: IMsg) => {
  return (
    <div
      style={{
        border: "solid 1px black",
        borderRadius: 10,
        margin: 3,
        padding: 5,
      }}
    >
      {props.text}
    </div>
  );
};

const MsgClient = () => {
  let [msgHistory, setMsgHistory] = React.useState([]);
  let [inputText, setInputText] = React.useState("");
  let [socket, setSocket] = React.useState(null);
  let [isConnected, setIsConnected] = React.useState(false);
  let searchInput = React.useRef(null);

  function connect(url: string): void {
    let ws = new WebSocket(url, []);
    setSocket(ws);

    //indicates that the connection is ready to send and receive data
    function onOpen(event: any): void {
      console.log("connected");
      setIsConnected(true);
    }

    //An event listener to be called when a message is received from the server
    function onMessage(event: any): void {
      console.log("msg rcvd", event);
      let newMsg = {
        text: event.data,
        received: true,
      };
      setMsgHistory((messages) => [...messages, newMsg]);
    }

    //An event listener to be called when an error occurs. This is a simple event named "error".
    function onError(event: any): void {
      console.log("Error:", JSON.stringify(event.data));
    }

    //An event listener to be called when the WebSocket connection's readyState changes to CLOSED.
    function onClose(event: any): void {
      console.log("Closed:", JSON.stringify(event.data));
      setIsConnected(false);
      setSocket(null);
    }

    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
  }

  if (!socket) {
    connect("ws://localhost:8000/ws");
  }
  console.log(inputText);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        display: "flex",
        border: "solid 1px red",
      }}
    >
      <div style={{ flex: 1, overflow: "scroll" }}>
        {msgHistory.map(Message)}
      </div>
      <div style={{ width: "100%", display: "flex" }}>
        <form
          style={{
            backgroundColor: "gray",
            display: "flex",
            padding: 10,
            flex: 1,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            if (socket) {
              let newMsg = {
                text: inputText,
                received: false,
              };
              console.log("sending", msgHistory);
              setMsgHistory((messages) => [...messages, newMsg]);
              setInputText("");
              socket.send(inputText);
              if (searchInput) {
                if (searchInput.current) searchInput.current.focus();
              }
            }
          }}
        >
          <input
            style={{ flex: 1 }}
            value={inputText}
            type="text"
            onInput={(e) => setInputText((e.target as HTMLInputElement).value)}
            autoFocus
            ref={searchInput}
          ></input>
          <input type="submit" value="send" disabled={!isConnected}></input>
        </form>
      </div>
    </div>
  );
};

ReactDOM.render(<MsgClient />, document.getElementById("root"));
