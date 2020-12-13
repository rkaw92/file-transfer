import { LocalizationProvider, Localized } from '@fluent/react';
import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { render } from 'react-dom';
import io from 'socket.io-client';
import { l10n } from './l10n';

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
        <Localized id="waiting-for-files">
            <p>waiting for files</p>
        </Localized>
    </LocalizationProvider>;
}

render(<RecvApp />, document.querySelector('main'));
