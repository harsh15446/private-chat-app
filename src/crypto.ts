// src/crypto.ts

// Room code se same encryption key banegi

export async function createRoomKey(
  roomCode: string
) {

  const encoder =
    new TextEncoder();


  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(roomCode)
    );


  return await crypto.subtle.importKey(
    "raw",
    hash,
    {
      name: "AES-GCM",
    },
    false,
    [
      "encrypt",
      "decrypt"
    ]
  );

}



export async function encryptText(
  text:string,
  key:CryptoKey
){

  const iv =
    crypto.getRandomValues(
      new Uint8Array(12)
    );


  const encrypted =
    await crypto.subtle.encrypt(
      {
        name:"AES-GCM",
        iv
      },
      key,
      new TextEncoder()
      .encode(text)
    );


  return {

    data:Array.from(
      new Uint8Array(encrypted)
    ),

    iv:Array.from(iv)

  };

}




export async function decryptText(
  data:number[],
  iv:number[],
  key:CryptoKey
){

  const decrypted =
    await crypto.subtle.decrypt(
      {
        name:"AES-GCM",
        iv:new Uint8Array(iv)
      },
      key,
      new Uint8Array(data)
    );


  return new TextDecoder()
  .decode(decrypted);

}