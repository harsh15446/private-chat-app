type Props = {
  user: string;
  text: string;
  time?: any;
  currentUser: string;
};

function MessageBubble({
  user,
  text,
  time,
  currentUser,
}: Props) {
  const isMine = user === currentUser;

  const messageTime = time
    ? new Date(
        time.seconds
          ? time.seconds * 1000
          : time
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={
        isMine
          ? "message sent"
          : "message received"
      }
    >
      <strong>{user}</strong>

      <div>{text}</div>

      <div className="message-time">
        {messageTime}
      </div>
    </div>
  );
}

export default MessageBubble;