import { useState } from "react";
import ChatRoom from "./ChatRoom";
import JoinRoom from "./components/JoinRoom";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [join, setJoin] = useState(false);

  if (join) {
    return <ChatRoom roomId={room} username={name} />;
  }

  return (
    <JoinRoom
      name={name}
      room={room}
      setName={setName}
      setRoom={setRoom}
      joinChat={() => {
        if (!name.trim() || !room.trim()) return;
        setJoin(true);
      }}
    />
  );
}

export default App;