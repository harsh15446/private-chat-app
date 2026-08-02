import { useEffect, useRef, useState } from "react";

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
} from "firebase/firestore";

import {
  ref,
  set,
  onValue,
  onDisconnect,
  serverTimestamp,
} from "firebase/database";

import EmojiPicker from "emoji-picker-react";

import { db, rtdb } from "./firebase";

import ChatHeader from "./components/ChatHeader";
import MessageBubble from "./components/MessageBubble";

import "./App.css";


type Message = {
  id:string;
  text:string;
  user:string;
  time:any;
};


type Props = {
  roomId:string;
  username:string;
};



function ChatRoom({
roomId,
username
}:Props){


const [message,setMessage] =
useState("");

const [messages,setMessages] =
useState<Message[]>([]);

const [allowed,setAllowed] =
useState(false);

const [loading,setLoading] =
useState(true);

const [showEmoji,setShowEmoji] =
useState(false);

const [onlineUsers,setOnlineUsers] =
useState<string[]>([]);

const [typingUsers,setTypingUsers] =
useState<string[]>([]);



const bottomRef =
useRef<HTMLDivElement|null>(null);



// ROOM CHECK

useEffect(()=>{


async function checkRoom(){


const roomRef =
doc(db,"rooms",roomId);


const snap =
await getDoc(roomRef);



if(!snap.exists()){


await setDoc(roomRef,{
members:[username]
});


setAllowed(true);
setLoading(false);
return;

}



const data =
snap.data();


const members =
data.members || [];



if(members.includes(username)){

setAllowed(true);
setLoading(false);
return;

}



if(members.length >= 2){

setAllowed(false);
setLoading(false);

alert("Room Full");

return;

}



await updateDoc(roomRef,{
members:arrayUnion(username)
});


setAllowed(true);
setLoading(false);


}


checkRoom();


},[roomId,username]);


// ONLINE START

// 🟢 ONLINE STATUS

useEffect(()=>{


if(!allowed) return;


const userRef =
ref(
rtdb,
`rooms/${roomId}/onlineUsers/${username}`
);



set(userRef,{

online:true,

lastSeen:serverTimestamp()

});



onDisconnect(userRef)
.set({

online:false,

lastSeen:serverTimestamp()

});



const usersRef =
ref(
rtdb,
`rooms/${roomId}/onlineUsers`
);



const unsubscribe =
onValue(usersRef,(snap)=>{


const data =
snap.val();



if(data){


const users =
Object.keys(data)
.filter(
user => data[user].online
);


setOnlineUsers(users);


}else{


setOnlineUsers([]);

}


});



return ()=>unsubscribe();


},[
allowed,
roomId,
username
]);





// ✍️ TYPING STATUS

useEffect(()=>{


if(!allowed)return;


const typingRef =
ref(
rtdb,
`rooms/${roomId}/typing/${username}`
);



set(
typingRef,
message.length > 0
);



return ()=>{

set(
typingRef,
false
);

};


},[
message,
allowed,
roomId,
username
]);






// 👀 LISTEN TYPING

useEffect(()=>{


if(!allowed)return;



const typingRef =
ref(
rtdb,
`rooms/${roomId}/typing`
);



const unsubscribe =
onValue(
typingRef,
(snap)=>{


const data =
snap.val();


if(data){


setTypingUsers(

Object.keys(data)
.filter(
user =>
data[user] === true &&
user !== username
)

);


}else{


setTypingUsers([]);

}


});


return ()=>unsubscribe();


},[
allowed,
roomId,
username
]);





// 💬 LOAD MESSAGES

useEffect(()=>{


if(!allowed)return;


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



const unsubscribe =
onSnapshot(q,(snapshot)=>{


setMessages(

snapshot.docs.map(doc=>({

id:doc.id,

...(doc.data() as Omit<Message,"id">)

}))

);


});



return ()=>unsubscribe();


},[
allowed,
roomId
]);
 

// AUTO SCROLL

useEffect(()=>{


bottomRef.current?.scrollIntoView({

behavior:"smooth"

});


},[messages]);





// SEND MESSAGE

const sendMessage =
async()=>{


if(!message.trim())
return;



await addDoc(

collection(
db,
"rooms",
roomId,
"messages"
),

{

text:message,

user:username,

time:new Date()

}

);



setMessage("");

};






if(loading){

return (

<div className="chat-container">

Checking Room...

</div>

);

}





if(!allowed){

return (

<div className="chat-container">

<div className="chat-box">

<h2>
🔒 Room Full
</h2>

<p>
Only 2 users allowed
</p>

</div>

</div>

);

}





return (

<div className="chat-container">

<div className="chat-box">


<ChatHeader roomId={roomId}/>



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

messages.map((msg)=>(


<MessageBubble

key={msg.id}

user={msg.user}

text={msg.text}

currentUser={username}

/>


))

}



<div ref={bottomRef}/>


</div>





{
showEmoji &&

<div className="emoji-box">

<EmojiPicker

onEmojiClick={(emoji)=>{

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

onClick={()=>setShowEmoji(!showEmoji)}

>

😀

</button>




<input

value={message}

placeholder="Type message..."

onChange={(e)=>

setMessage(e.target.value)

}

/>



<button

onClick={sendMessage}

>

Send

</button>


</div>




</div>

</div>


);


}


export default ChatRoom;