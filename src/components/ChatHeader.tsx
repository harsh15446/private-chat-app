type Props = {
  roomId: string;
};

function ChatHeader({ roomId }: Props) {
  return (
    <div className="chat-header">
      <h2>🔒 Private Chat</h2>

      <p>
        Room: <b>{roomId}</b>
      </p>
    </div>
  );
}

export default ChatHeader;