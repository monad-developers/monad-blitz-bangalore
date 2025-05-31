"use client"
import React, { useEffect, useState } from 'react'
import { sdk } from '@farcaster/frame-sdk'
import dynamic from 'next/dynamic';

import { FrameProvider } from './farcaster-proivder';

const Demo = dynamic(() => import("@/app/components/Main"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

function Home() {
    return (
        <FrameProvider>
            <Demo />
        </FrameProvider>
    )
}

export default Home