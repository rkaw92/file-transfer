import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { render } from 'react-dom';
import cuid from 'cuid';
import bwipjs from 'bwip-js';
import io from 'socket.io-client';
import { Helmet } from 'react-helmet';
import { LocalizationProvider, Localized } from '@fluent/react';
import { l10n } from './l10n';
import { Step, StepTitle } from './step';

const BACKEND_URL = import.meta.env.SNOWPACK_PUBLIC_BACKEND_URL || 'http://localhost:3040';

function ReceiverLink({ channelID }) {
    const linkToReceiverPage = `${window.origin}/recv.html?channelID=${channelID}`;
    const dataURL = useMemo(function() {
        const canvas = document.createElement('canvas');
        bwipjs.toCanvas(canvas, {
            bcid: 'qrcode',
            text: linkToReceiverPage,
            scale: 4
        });
        return canvas.toDataURL('image/png');
    }, [ window.origin, channelID ]);
    
    return <Step>
        <StepTitle><Localized id="header-send-sub-1">1. Scan this code with the target device</Localized></StepTitle>
        <div className="flex">
            <img className="flex-initial" alt="Scan this QR code using the receiver device" src={dataURL} />
            <div className="flex-auto">
                <p className="m-2"><Localized id="hint-receiver">Scan the displayed code using a camera app or a barcode reader app on your mobile device.</Localized></p>
                <p className="m-2"><Localized id="link-receiver">Alternatively, you can copy this link and paste it on the target device:</Localized> <Localized id="link-receiver-label"><a href={linkToReceiverPage} className="text-blue-500 visited:text-pink-500">LINK</a></Localized></p>
            </div>
        </div>
    </Step>;
}

function Send({ channelID, receiverOnline }) {
    const [ file, setFile ] = useState();
    const onFileSelect = useCallback(function(event) {
        setFile(event.target.files[0]);
    }, []);
    const onSubmit = useCallback(function(event) {
        event.preventDefault();
        const uploadID = cuid();
        const data = new FormData();
        data.append('file', file);
        fetch(`${BACKEND_URL}/upload/${channelID}/${uploadID}`, {
            method: 'POST',
            body: data
        }).then(function() {
            // TODO: now what? Provide some kind of feedback!
        }, function(error) {
            console.log(error);
            // TODO: Actually display the error to the user (users are not developers).
        });
    }, [ file ]);
    return <>
        <Step>
            <StepTitle><Localized id="header-send-sub-2">2. Select a file to send</Localized></StepTitle>
            <form onSubmit={onSubmit}>
                <input type="file" onChange={onFileSelect} />
            </form>
        </Step>
        <Step>
            <StepTitle><Localized id="header-send-sub-3">3. Send!</Localized></StepTitle>
            <Localized id="button-send">
                <button disabled={!receiverOnline} onClick={onSubmit} className="p-4 px-12 bg-blue-500 text-white text-center font-bold rounded disabled:bg-red-200">
                    Send
                </button>
            </Localized>
        </Step>
    </>;
}

function SendApp() {
    const channelID = useMemo(() => cuid(), []);
    const [ receiverReady, setReceiverReady ] = useState(false);
    const socket = useMemo(() => io(BACKEND_URL, {
        transports: [ 'websocket' ]
    }), []);
    useEffect(function() {
        socket.emit('senderReady', channelID);
        socket.on('receiverReady', function() {
            setReceiverReady(true);
        });
    }, [ channelID ]);
    return <LocalizationProvider l10n={l10n}>
        <Localized id="send-head" attrs={{ title: true }}><Helmet title="" /></Localized>
        <header className="container mx-auto text-center text-2xl font-heading font-bold m-2">
            <Localized id="header-send"><h1>Send a file</h1></Localized>
        </header>
        <main className="container mx-auto">
            <ReceiverLink channelID={channelID} />
            <Send channelID={channelID} receiverOnline={receiverReady} />
        </main>
    </LocalizationProvider>;
}

render(<SendApp />, document.querySelector('body'));
