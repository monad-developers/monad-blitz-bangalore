// import * as LitJsSdk from "@lit-protocol/lit-node-client";
// import { LitNodeClient } from "@lit-protocol/lit-node-client";
// import { decryptToString, encryptString, encryptFile, decryptToFile } from "@lit-protocol/encryption";
// import { LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
// import {
//   createSiweMessage,
//   createSiweMessageWithRecaps,
//   generateAuthSig,
//   LitAccessControlConditionResource,
// } from "@lit-protocol/auth-helpers";
// import { ethers, BrowserProvider } from "ethers";

// import { Uploader } from "@irys/upload";
// import { Ethereum } from "@irys/upload-ethereum";


// const litClient = new LitNodeClient({
//   litNetwork: LIT_NETWORK.DatilDev,
// });

// function getAccessControlConditions(): object[] {
//   return [
//     {
//       contractAddress: "",
//       standardContractType: "",
//       chain: "baseSepolia",
//       method: "",
//       parameters: [":userAddress"],
//       returnValueTest: {
//         comparator: "=",
//         value: "0xd53cc2fad80f2661e7fd70fc7f2972a9fd9904c3",
//       },
//     },
//   ];
// }

// export const encryptData = async (
//   text: string
// ): Promise<{ ciphertext: string; dataToEncryptHash: string }> => {
//   await litClient.connect();



//   const accessControlConditions = getAccessControlConditions();

//   const { ciphertext, dataToEncryptHash } = await encryptString(
//     {
//       accessControlConditions,
//       dataToEncrypt: text,
//     },
//     litClient
//   );

//   console.log({ ciphertext, dataToEncryptHash });
//   return { ciphertext, dataToEncryptHash };
// };

// export const decryptData = async (
//   encryptedText: string,
//   dataToEncryptHash: string
// ): Promise<string> => {
//   await litClient.connect();

//   const provider = new BrowserProvider(window.ethereum);
//   const signer = await provider.getSigner();
//   const walletAddress = await signer.getAddress();

//   const latestBlockhash = await litClient.getLatestBlockhash();

//   const authNeededCallback = async (params: any) => {
//     if (!params.uri) throw new Error("uri is required");
//     if (!params.expiration) throw new Error("expiration is required");
//     if (!params.resourceAbilityRequests)
//       throw new Error("resourceAbilityRequests is required");

//     const toSign = await createSiweMessageWithRecaps({
//       uri: params.uri,
//       expiration: params.expiration,
//       resources: params.resourceAbilityRequests,
//       walletAddress: walletAddress,
//       nonce: latestBlockhash,
//       litNodeClient: litClient,
//     });

//     const authSig = await generateAuthSig({
//       signer: signer,
//       toSign,
//     });

//     return authSig;
//   };

//   const litResource = new LitAccessControlConditionResource("*");

//   const sessionSigs = await litClient.getSessionSigs({
//     chain: "baseSepolia",
//     resourceAbilityRequests: [
//       {
//         resource: litResource,
//         ability: LIT_ABILITY.AccessControlConditionDecryption,
//       },
//     ],
//     authNeededCallback,
//   });

//   const decryptedString = await decryptToString(
//     {
//       accessControlConditions: getAccessControlConditions(),
//       chain: "baseSepolia",
//       ciphertext: encryptedText,
//       dataToEncryptHash,
//       sessionSigs,
//     },
//     litClient
//   );

//   return decryptedString;
// };

 
// const getIrysUploader = async () => {
//   const irysUploader = await Uploader(Ethereum).withWallet(process.env.PRIVATE_KEY);
//   return irysUploader;
// };

// const gatewayAddress = "https://ipfs.io/ipfs/";


// export const uploadToIrys = async (cipherText: string, dataToEncryptHash: string): Promise<string> => {
//     const irysUploader = await getIrysUploader();
  
//     const dataToUpload = {
//       cipherText: cipherText,
//       dataToEncryptHash: dataToEncryptHash,
//       accessControlConditions: getAccessControlConditions(),
//     };
  
//     try {
//       const tags = [{ name: "Content-Type", value: "application/json" }];
//       const receipt = await irysUploader.upload(JSON.stringify(dataToUpload), { tags });
//       return receipt?.id ? `${gatewayAddress}${receipt.id}` : "";
//     } catch (error) {
//       console.error("Error uploading data: ", error);
//       throw error;
//     }
//   };


//   export const downloadFromIrys = async (id: string): Promise<[string, string, object[]]> => {
//     const url = `${gatewayAddress}${id}`;
  
//     try {
//       const response = await fetch(url);
//       if (!response.ok) throw new Error(`Failed to retrieve data for ID: ${id}`);
//       const data = await response.json();
  
//       const ciphertext = data.cipherText;
//       const dataToEncryptHash = data.dataToEncryptHash;
  
//       return [ciphertext, dataToEncryptHash, data.accessControlConditions];
//     } catch (error) {
//       console.error("Error retrieving data: ", error);
//       return ["", "", []];
//     }
//   };







//   export const encryptAndUpload = async (jsonString: string): Promise<string> => {
//     try {
//       // Step 1: Encrypt the JSON data
//       await litClient.connect();
//       const accessControlConditions = getAccessControlConditions();
//       const { ciphertext, dataToEncryptHash } = await encryptString(
//         {
//           accessControlConditions,
//           dataToEncrypt: jsonString,
//         },
//         litClient
//       );
//       console.log("Encrypted Data:", ciphertext);
  
//       // Step 2: Upload the encrypted data to Irys
//       const irysUploader = await Uploader(Ethereum).withWallet(process.env.PRIVATE_KEY);
//       const dataToUpload = {
//         cipherText: ciphertext,
//         dataToEncryptHash,
//         accessControlConditions,
//       };
  
//       const tags = [{ name: "Content-Type", value: "application/json" }];
//       const receipt = await irysUploader.upload(JSON.stringify(dataToUpload), { tags });
  
//       const uploadUrl = receipt?.id ? `${gatewayAddress}${receipt.id}` : "";
//       console.log("Data uploaded to:", uploadUrl);
  
//       return uploadUrl; // Return the URL where the data is uploaded
//     } catch (error) {
//       console.error("Error encrypting or uploading:", error);
//       throw error;
//     }
//   };

  
//   export const downloadAndDecrypt = async (uploadUrl: string): Promise<string> => {
//     try {
//       // Step 1: Download the encrypted data from Irys
//       const response = await fetch(uploadUrl);
//       if (!response.ok) throw new Error(`Failed to retrieve data from URL: ${uploadUrl}`);
      
//       const data = await response.json();
//       const { cipherText, dataToEncryptHash, accessControlConditions } = data;
//       console.log("Downloaded Encrypted Data:", cipherText);
  
//       // Step 2: Decrypt the data using Lit Protocol
//       await litClient.connect();
//       const provider = new BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const walletAddress = await signer.getAddress();
  
//       const latestBlockhash = await litClient.getLatestBlockhash();
  
//       const authNeededCallback = async (params: any) => {
//         if (!params.uri) throw new Error("uri is required");
//         if (!params.expiration) throw new Error("expiration is required");
//         if (!params.resourceAbilityRequests)
//           throw new Error("resourceAbilityRequests is required");
  
//         const toSign = await createSiweMessage({
//           uri: params.uri,
//           expiration: params.expiration,
//           resources: params.resourceAbilityRequests,
//           walletAddress: walletAddress,
//           nonce: latestBlockhash,
//           litNodeClient: litClient,
//         });
  
//         const authSig = await generateAuthSig({
//           signer: signer,
//           toSign,
//         });
  
//         return authSig;
//       };
  
//       const litResource = new LitAccessControlConditionResource("*");
  
//       const sessionSigs = await litClient.getSessionSigs({
//         chain: "baseSepolia",
//         resourceAbilityRequests: [
//           {
//             resource: litResource,
//             ability: LIT_ABILITY.AccessControlConditionDecryption,
//           },
//         ],
//         authNeededCallback,
//       });
  
//       const decryptedString = await decryptToString(
//         {
//           accessControlConditions: accessControlConditions,
//           chain: "baseSepolia",
//           ciphertext: cipherText,
//           dataToEncryptHash,
//           sessionSigs,
//         },
//         litClient
//       );
  
//       console.log("Decrypted Data:", decryptedString);
  
//       return decryptedString; // Return the decrypted string (original JSON)
//     } catch (error) {
//       console.error("Error downloading or decrypting:", error);
//       throw error;
//     }
//   };
  