"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { monadTestnet } from "viem/chains";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useSendTransaction,
    useSwitchChain,
} from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { useMiniAppContext } from "../hooks/useMiniAppContext";
import { useTransactionStore } from "../store/transactionStore";

export function User() {
    const [inputText, setInputText] = useState("")
    const { isEthProviderAvailable, context } = useMiniAppContext();
    const { isConnected, address, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: hash, sendTransaction } = useSendTransaction();
    const { switchChain } = useSwitchChain();
    const { connect } = useConnect();

    const [isListening, setIsListening] = useState(false)
    const setTransaction = useTransactionStore((state) => state.setTransaction)

    const handleVoiceInput = async () => {
        setIsListening(true)
        try {
            console.log('send')
            const response = await fetch('/api/voice', { method: 'POST' })
            const data = await response.json()

            console.log(data)

            if (data.error) {
                console.error('Error:', data.error)
                return
            }

            // Set the transcribed text in the input field
            // setInputText(data.transcript || '')

            // Log both the transcript and parsed result
            console.log('Voice transcript:', data.transcript)
            console.log('Parsed transaction:', data.parsed)

        } catch (error) {
            console.error('Error processing voice input:', error)
        } finally {
            setIsListening(false)
        }
    }

    const handleParseInput = async () => {
        if (!inputText.trim()) return;

        try {
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            })
            const data = await response.json()
            console.log('Transaction parsed:', data)
            if (data.error) {
                console.error('Error:', data.error)
            }
        } catch (error) {
            console.error('Error parsing input:', error)
        }
    }

    "0x420AeF56973233F735B9501F234b31ff5c47bE62"
    async function sendTransactionHandler() {
        // setIsListening(true)
        sendTransaction({
            to: inputText,
            value: parseEther("1"),
        });
        // setIsListening(false)
    }

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await handleParseInput()
        }
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            {/* User Context Section */}
            <div className="space-y-4 border border-[#333] rounded-lg p-4 bg-[#f9fafb]">
                <div className="flex flex-row space-x-4 justify-start items-start">
                    {context?.user ? (
                        <>
                            {context?.user?.pfpUrl && (
                                <img
                                    src={context?.user?.pfpUrl}
                                    className="w-14 h-14 rounded-full border-2 border-[#4066E0]"
                                    alt="User Profile Picture"
                                    width={56}
                                    height={56}
                                />
                            )}
                            <div className="flex flex-col justify-start items-start space-y-2">
                                <p className="text-sm text-left">
                                    <span className="font-medium text-black">Name:</span>{" "}
                                    <span className="bg-white font-mono text-black rounded px-2 py-1">
                                        {context?.user?.displayName}
                                    </span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-left">User context not available</p>
                    )}
                </div>
            </div>

            {/* Wallet Actions Section */}
            <div className="space-y-4 border border-[#333] rounded-lg p-4 bg-[#f9fafb]">
                <div className="flex flex-row space-x-4 justify-start items-start">
                    {isConnected ? (
                        <div className="flex flex-col space-y-4 justify-start w-full">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#4066E0] to-[#834EE3] rounded-full blur-md opacity-25"></div>
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#4066E0]/90 to-[#834EE3]/90 backdrop-blur-sm flex items-center justify-center text-white font-medium border border-white/20">
                                        ?
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium text-gray-500">
                                        Connected Account
                                    </p>
                                    <p className="text-[#4066E0] font-medium tracking-wide text-sm">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </p>
                                </div>
                            </div>
                            {chainId === monadTestnet.id ? (
                                <div className="flex flex-col space-y-2 border border-[#333] p-4 rounded-md bg-white">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter address"
                                        className="flex-1 h-12 px-6 rounded-full bg-white/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(64,102,224,0.12)] border border-[#4066E0]/10 focus:border-[#4066E0] focus:ring-4 focus:ring-[#4066E0]/10 outline-none transition-all duration-200 text-gray-700"
                                    />
                                    <button
                                        onClick={sendTransactionHandler}
                                        disabled={isListening}
                                        className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-[#4066E0] to-[#834EE3] p-[1px] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(64,102,224,0.3)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-95 disabled:opacity-50 flex justify-center items-center"
                                        aria-label="Voice Input"
                                    >
                                        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-[#4066E0] to-[#834EE3] blur-xl opacity-0 group-hover:opacity-60 transition-opacity"></span>
                                        <div className="relative w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                                            <p className="text-4xl cursor-pointer leading-none">🎙️</p>
                                        </div>
                                    </button>
                                    {isListening ? <p className="text-black">
                                        listening...
                                    </p> : ""}


                                    {hash && (
                                        <button
                                            className="bg-white border border-[#4066E0] hover:bg-[#f0f5ff] text-[#4066E0] rounded-md p-2 text-sm transition-colors"
                                            onClick={() =>
                                                window.open(
                                                    `https://testnet.monadexplorer.com/tx/${hash}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            View Transaction
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    className="bg-[#4066E0] hover:bg-[#3a5ec9] text-white rounded-md p-2 text-sm transition-colors"
                                    onClick={() => switchChain({ chainId: monadTestnet.id })}
                                >
                                    Switch to Monad Testnet
                                </button>
                            )}
                            <button
                                className="bg-white border border-red-500 hover:bg-red-50 text-red-500 rounded-md p-2 text-sm transition-colors"
                                onClick={() => disconnect()}
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    ) : isEthProviderAvailable ? (
                        <button
                            className="bg-[#4066E0] hover:bg-[#3a5ec9] text-white rounded-md p-2 text-sm w-full transition-colors"
                            onClick={() => connect({ connector: farcasterFrame() })}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <p className="text-sm text-left">Wallet connection only via Warpcast</p>
                    )}
                </div>
            </div>
        </div>
    );
}
