import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  createCall,
  listenCall,
  sendAnswer,
  sendCandidate,
  listenCandidates,
  removeCall
} from "../webrtc";


type Props = {
  roomId: string;
  caller?: boolean;
};


export default function VoiceCall({
  roomId,
  caller = false
}: Props) {


  const [calling, setCalling] =
    useState(false);


  const [incoming, setIncoming] =
    useState(false);


  const [connected, setConnected] =
    useState(false);


  const [muted, setMuted] =
    useState(false);



  const localStream =
    useRef<MediaStream | null>(null);


  const remoteAudio =
    useRef<HTMLAudioElement | null>(null);


  const peer =
    useRef<RTCPeerConnection | null>(null);



  const createPeer = () => {


    const pc =
      new RTCPeerConnection({

        iceServers:[
          {
            urls:
            "stun:stun.l.google.com:19302"
          }
        ]

      });



    pc.onicecandidate =
      (event)=>{

        if(event.candidate){

          sendCandidate(
            roomId,
            event.candidate
          );

        }

      };



    pc.ontrack =
      (event)=>{

        if(remoteAudio.current){

          remoteAudio.current.srcObject =
            event.streams[0];

        }

        setConnected(true);

      };



    peer.current = pc;

    return pc;

  };





  const startCall = async()=>{


    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });



    localStream.current =
      stream;



    const pc =
      createPeer();



    stream
    .getTracks()
    .forEach(track=>{

      pc.addTrack(
        track,
        stream
      );

    });



    const offer =
      await pc.createOffer();


    await pc.setLocalDescription(
      offer
    );


    await createCall(
      roomId,
      offer
    );


    setCalling(true);



    listenCandidates(
      roomId,
      async(candidate:any)=>{

        try{

          await pc.addIceCandidate(
            candidate
          );

        }catch{}

      }
    );


  };





  const acceptCall = async()=>{


    setIncoming(false);



    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });



    localStream.current =
      stream;



    const pc =
      createPeer();



    stream
    .getTracks()
    .forEach(track=>{

      pc.addTrack(
        track,
        stream
      );

    });



    listenCall(
      roomId,
      async(call:any)=>{


        if(
          call?.offer
        ){


          await pc.setRemoteDescription(
            call.offer
          );



          const answer =
            await pc.createAnswer();



          await pc.setLocalDescription(
            answer
          );



          await sendAnswer(
            roomId,
            answer
          );


        }


      }
    );



    setCalling(true);


  };






  useEffect(()=>{


    if(caller)
      return;



    const stop =
      listenCall(
        roomId,
        (call:any)=>{


          if(
            call?.status === "calling"
          ){

            setIncoming(true);

          }


        }
      );


    return ()=>stop();


  },[
    caller,
    roomId
  ]);







  const toggleMute = ()=>{


    const track =
      localStream.current
      ?.getAudioTracks()[0];


    if(track){

      track.enabled =
        !track.enabled;


      setMuted(
        !track.enabled
      );

    }


  };







  const endCall = async()=>{


    localStream.current
    ?.getTracks()
    .forEach(
      t=>t.stop()
    );



    peer.current?.close();



    await removeCall(
      roomId
    );


    setCalling(false);

    setConnected(false);


  };






  return (

    <div className="voice-call">


      <audio
        ref={remoteAudio}
        autoPlay
      />



      {!calling && caller && (

        <button
          onClick={startCall}
        >
          📞 Call
        </button>

      )}




      {incoming && (

        <div className="incoming-call">

          <h3>
            📞 Incoming Call
          </h3>


          <button
            onClick={acceptCall}
          >
            ✅ Accept
          </button>


          <button
            onClick={endCall}
          >
            ❌ Reject
          </button>

        </div>

      )}






      {calling && (

        <div className="call-panel">


          <h2>
            🎧 Voice Call
          </h2>


          <p>
            {
              connected
              ? "🟢 Connected"
              : "🔄 Connecting..."
            }
          </p>



          <button
            onClick={toggleMute}
          >

            {
              muted
              ? "🔇 Unmute"
              : "🎤 Mute"
            }

          </button>




          <button
            onClick={endCall}
          >
            🔴 End Call
          </button>



        </div>

      )}



    </div>

  );

}