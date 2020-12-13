import { LocalizationProvider, Localized } from '@fluent/react';
import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { render } from 'react-dom';
import io from 'socket.io-client';
import { l10n } from './l10n';
import { Step, StepTitle } from './step';

const BACKEND_URL = import.meta.env.SNOWPACK_PUBLIC_BACKEND_URL || 'http://localhost:3040';

function RecvApp() {
    const channelID = useMemo(function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('channelID');
    }, [ window.location.search ]);
    const socket = useMemo(() => io(BACKEND_URL, {
        transports: [ 'websocket' ]
    }), []);
    const onUpload = useCallback(function(uploadID) {
        const link = document.createElement('a');
        link.setAttribute('href', `${BACKEND_URL}/download/${uploadID}`);
        link.setAttribute('download', true);
        link.click();
    }, []);
    useEffect(function() {
        socket.emit('receiverReady', channelID);
        socket.on('upload', onUpload);
    });
    
    return <LocalizationProvider l10n={l10n}>
        <header className="container mx-auto text-center text-2xl font-heading font-bold m-2">
            <Localized id="header-receive"><h1>Receive files</h1></Localized>
        </header>
        <main className="container mx-auto">
            <Step>
                <StepTitle><Localized id="header-receive-sub-1">Wait for the sender to start</Localized></StepTitle>
                <Localized id="waiting-for-files"><p>...</p></Localized>
            </Step>
        </main>
    </LocalizationProvider>;
}

render(<RecvApp />, document.querySelector('body'));
