type Props = {
  name: string;
  room: string;
  setName: (value: string) => void;
  setRoom: (value: string) => void;
  joinChat: () => void;
};

function JoinRoom({
  name,
  room,
  setName,
  setRoom,
  joinChat,
}: Props) {
  return (
    <div className="chat-container">

      <div className="chat-box">

        <div className="chat-header">
          <h2>🔒 Private Chat</h2>

          <p>
            Secure 2 User Room
          </p>
        </div>


        <div className="join-form">


          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />


          <input
            type="text"
            placeholder="Enter Room Code"
            value={room}
            onChange={(e) =>
              setRoom(e.target.value)
            }
          />


          <button
            onClick={joinChat}
          >
            🔐 Join Private Room
          </button>


          <div className="security-info">

            🛡️ Only 2 users allowed  
            <br />

            🔒 Private encrypted chat

          </div>


        </div>

      </div>

    </div>
  );
}

export default JoinRoom;