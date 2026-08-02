import {
  ref,
  set,
  onValue,
  remove,
  push
} from "firebase/database";

import { rtdb } from "./firebase";



export const createCall = async (
  roomId: string,
  offer: any
) => {

  await set(
    ref(
      rtdb,
      `calls/${roomId}`
    ),
    {
      offer,
      status: "calling"
    }
  );

};





export const listenCall = (
  roomId:string,
  callback:any
)=>{


 return onValue(

  ref(
    rtdb,
    `calls/${roomId}`
  ),

  (snap)=>{

    callback(
      snap.val()
    );

  }

 );


};





export const sendAnswer = async(
 roomId:string,
 answer:any
)=>{


 await set(

  ref(
   rtdb,
   `calls/${roomId}/answer`
  ),

  answer

 );


};





export const sendCandidate = async(
 roomId:string,
 candidate:any
)=>{


 await push(

  ref(
   rtdb,
   `calls/${roomId}/candidates`
  ),

  candidate

 );


};





export const listenCandidates = (
 roomId:string,
 callback:any
)=>{


 return onValue(

  ref(
   rtdb,
   `calls/${roomId}/candidates`
  ),

  (snap)=>{


   const data =
    snap.val();


   if(data){

    Object.values(data)
    .forEach(callback);

   }


  }

 );


};





export const removeCall = async(
 roomId:string
)=>{


 await remove(

  ref(
   rtdb,
   `calls/${roomId}`
  )

 );


};