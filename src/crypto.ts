// src/crypto.ts

export async function createKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}


export async function exportKey(key: CryptoKey) {
  const exported =
    await crypto.subtle.exportKey(
      "jwk",
      key
    );

  return JSON.stringify(exported);
}


export async function importKey(
  keyString:string
) {

  const jwk =
    JSON.parse(keyString);


  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name:"AES-GCM",
    },
    true,
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


  const encoded =
    new TextEncoder()
    .encode(text);


  const encrypted =
    await crypto.subtle.encrypt(
      {
        name:"AES-GCM",
        iv
      },
      key,
      encoded
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