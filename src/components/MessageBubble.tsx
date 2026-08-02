type Props = {
  user: string;
  text: string;
  currentUser: string;
};

function MessageBubble({
  user,
  text,
  currentUser,
}: Props) {
  const isMine = user === currentUser;

  return (
    <div
      className={
        isMine
          ? "message sent"
          : "message received"
      }
    >
      <strong>{user}</strong>

      <br />

      {text}
    </div>
  );
}

export default MessageBubble;