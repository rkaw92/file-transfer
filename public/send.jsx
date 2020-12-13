import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { render } from 'react-dom';
import cuid from 'cuid';
import bwipjs from 'bwip-js';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.SNOWPACK_PUBLIC_BACKEND_URL || 'http://localhost:3040';

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
    return <form onSubmit={onSubmit}>
        <input type="file" onChange={onFileSelect} />
        <button disabled={!receiverOnline}>Send</button>
    </form>;
}

function ReceiverLink({ channelID }) {
    const linkToReceiverPage = `/recv.html?channelID=${channelID}`;
    const dataURL = useMemo(function() {
        const canvas = document.createElement('canvas');
        bwipjs.toCanvas(canvas, {
            bcid: 'qrcode',
            text: linkToReceiverPage
        });
        return canvas.toDataURL('image/png');
    }, [ window.origin, channelID ]);
    
    return  <p>
        Receive files here: <a href={linkToReceiverPage}>LINK</a><br />
        <img alt="Scan this QR code using the receiver device" src={dataURL} />
    </p>;
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
    return <>
        <Send channelID={channelID} receiverOnline={receiverReady} />
        <ReceiverLink channelID={channelID} />
    </>;
}

render(<SendApp />, document.querySelector('main'));
