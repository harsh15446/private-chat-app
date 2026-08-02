import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  getDocs
} from "firebase/firestore";

import {
  ref,
  set,
  onValue,
  onDisconnect,
  serverTimestamp
} from "firebase/database";

import EmojiPicker from "emoji-picker-react";

import {
  createRoomKey,
  encryptText,
  decryptText
} from "./crypto";

import {
  db,
  rtdb
} from "./firebase";

import ChatHeader from "./components/ChatHeader";
import MessageBubble from "./components/MessageBubble";

import "./App.css";


type Message = {

  id: string;

  data?: number[];

  iv?: number[];

  text: string;

  user: string;

  time: any;

};


type Props = {

  roomId: string;

  username: string;

};


function ChatRoom({

  roomId,

  username

}: Props) {


  const [message, setMessage] =
    useState("");


  const [messages, setMessages] =
    useState<Message[]>([]);


  const [allowed, setAllowed] =
    useState(false);


  const [loading, setLoading] =
    useState(true);


  const [showEmoji, setShowEmoji] =
    useState(false);


  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);


  const [typingUsers, setTypingUsers] =
    useState<string[]>([]);


  const [roomKey, setRoomKey] =
    useState<CryptoKey | null>(null);


  const bottomRef =
    useRef<HTMLDivElement | null>(null);
    // E2EE ROOM JOIN

useEffect(() => {


  async function joinRoom() {


    const key =
      await createRoomKey(roomId);


    setRoomKey(key);



    const roomRef =
      doc(db, "rooms", roomId);



    const snap =
      await getDoc(roomRef);



    // CREATE NEW ROOM

    if (!snap.exists()) {


      await setDoc(roomRef, {

        members: [username]

      });


      setAllowed(true);

      setLoading(false);

      return;

    }



    const data =
      snap.data();



    const members =
      data.members || [];



    // SAME USER REJOIN

    if (members.includes(username)) {


      setAllowed(true);

      setLoading(false);

      return;

    }



    // ONLY 2 USERS ALLOWED

    if (members.length >= 2) {


      setAllowed(false);

      setLoading(false);

      return;

    }



    // ADD SECOND USER

    await updateDoc(roomRef, {

      members:
        arrayUnion(username)

    });



    setAllowed(true);

    setLoading(false);


  }



  joinRoom();


}, [

  roomId,

  username

]);
// ONLINE STATUS

useEffect(() => {


  if (!allowed) return;



  const userRef =
    ref(
      rtdb,
      `rooms/${roomId}/onlineUsers/${username}`
    );



  set(userRef, {

    online: true,

    lastSeen: serverTimestamp()

  });



  onDisconnect(userRef)
    .remove();



  const usersRef =
    ref(
      rtdb,
      `rooms/${roomId}/onlineUsers`
    );



  const unsub =
    onValue(usersRef, (snap) => {


      const data =
        snap.val();



      if (data) {


        setOnlineUsers(

          Object.keys(data)

            .filter(
              user => data[user].online
            )

        );


      } else {


        setOnlineUsers([]);


      }


    });



  return () => unsub();


}, [

  allowed,

  roomId,

  username

]);





// TYPING STATUS

useEffect(() => {


  if (!allowed) return;



  const typingRef =
    ref(
      rtdb,
      `rooms/${roomId}/typing/${username}`
    );



  set(
    typingRef,
    message.length > 0
  );



  return () => {


    set(
      typingRef,
      false
    );


  };


}, [

  message,

  allowed,

  roomId,

  username

]);






// LISTEN TYPING

useEffect(() => {


  if (!allowed) return;



  const typingRef =
    ref(
      rtdb,
      `rooms/${roomId}/typing`
    );



  const unsub =
    onValue(
      typingRef,
      (snap) => {


        const data =
          snap.val();



        if (data) {


          setTypingUsers(

            Object.keys(data)

              .filter(
                user =>
                  user !== username &&
                  data[user] === true
              )

          );


        } else {


          setTypingUsers([]);


        }


      }
    );



  return () => unsub();


}, [

  allowed,

  roomId,

  username

]);





// LOAD + DECRYPT MESSAGES

useEffect(() => {


  if (!allowed || !roomKey)
    return;



  const q =
    query(

      collection(
        db,
        "rooms",
        roomId,
        "messages"
      ),

      orderBy("time")

    );



  const unsub =
    onSnapshot(
      q,
      async(snapshot) => {


        const list: Message[] = [];



        for (const d of snapshot.docs) {


          const data =
            d.data();



          let text = "";



          if (
            data.data &&
            data.iv
          ) {


            text =
              await decryptText(

                data.data,

                data.iv,

                roomKey

              );


          } else {


            text =
              data.text || "";


          }



          list.push({

            id: d.id,

            text,

            user: data.user,

            time: data.time

          });


        }



        setMessages(list);


      }
    );



  return () => unsub();


}, [

  allowed,

  roomId,

  roomKey

]);
// REMOVE USER WHEN EXIT

useEffect(() => {


  if (!allowed)
    return;



  const removeUser =
    async () => {


      try {


        await updateDoc(

          doc(
            db,
            "rooms",
            roomId
          ),

          {

            members:
              arrayRemove(username)

          }

        );


      } catch (e) {}


    };



  window.addEventListener(
    "beforeunload",
    removeUser
  );



  return () => {


    window.removeEventListener(
      "beforeunload",
      removeUser
    );


  };


}, [

  allowed,

  roomId,

  username

]);






// AUTO SCROLL

useEffect(() => {


  bottomRef.current?.scrollIntoView({

    behavior: "smooth"

  });


}, [

  messages

]);





const deleteChatHistory = async () => {

  const ok = window.confirm(
    "Chat permanently delete karni hai?"
  );

  if (!ok) return;

  const messagesRef = collection(
    db,
    "rooms",
    roomId,
    "messages"
  );

  const snapshot = await getDocs(messagesRef);

  for (const msg of snapshot.docs) {
    await deleteDoc(msg.ref);
  }

  alert("✅ Chat history deleted.");

};
// SEND ENCRYPTED MESSAGE

const sendMessage =
  async () => {


    if (
      !message.trim() ||
      !roomKey
    )
      return;



    const encrypted =
      await encryptText(

        message,

        roomKey

      );



    await addDoc(

      collection(

        db,

        "rooms",

        roomId,

        "messages"

      ),

      {

        data:
          encrypted.data,

        iv:
          encrypted.iv,

        user:
          username,

        time:
          new Date()

      }

    );



    setMessage("");


  };
  if (loading) {


  return (

    <div className="chat-container">

      Checking Room...

    </div>

  );


}





if (!allowed) {


  return (

    <div className="chat-container">

      <div className="chat-box">


        <h2>
          🔒 Room Full
        </h2>


        <p>
          Try another room
        </p>


      </div>

    </div>

  );


}





return (

  <div className="chat-container">


    <div className="chat-box">


      <ChatHeader roomId={roomId} />



      <div className="online-status">

        🟢 Online:

        {" "}

        {onlineUsers.join(", ")}

      </div>





      {
        typingUsers.length > 0 &&

        <div className="typing">

          ✍️ {typingUsers.join(", ")} typing...

        </div>

      }






      <div className="messages">


        {

          messages.map((msg) => (


            <MessageBubble

              key={msg.id}

              user={msg.user}

              text={msg.text}

              time={msg.time}

              currentUser={username}

            />


          ))

        }



        <div ref={bottomRef} />


      </div>






      {

        showEmoji &&

        <div className="emoji-box">


          <EmojiPicker

            onEmojiClick={(emoji) => {


              setMessage(

                message + emoji.emoji

              );


              setShowEmoji(false);


            }}

          />


        </div>

      }







      <div className="input-box">


        <button

          onClick={() =>
            setShowEmoji(!showEmoji)
          }

        >

          😀

        </button>





        <input

          value={message}

          placeholder="Type message..."

          onChange={(e) =>

            setMessage(e.target.value)

          }

        />





        <button

          onClick={sendMessage}
          

        >
          <button
  onClick={deleteChatHistory}
>
  🗑 Delete Chat
</button>

          Send

        </button>


      </div>



    </div>


  </div>

);


}


export default ChatRoom;