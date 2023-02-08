import { useEthers } from '@usedapp/core';
import React from 'react';

const ConnectWallet = () => {
    const { activateBrowserWallet, account, isLoading } = useEthers();

    const getShortPublicKey = () => `${account}`;

    const accountData = () => 
        account ? (
            <span style={{ fontWeight: '500' }}>{getShortPublicKey()}</span>
        ) : (
            <span 
                className="btn btn-danger btn-sm"
                onClick={() => activateBrowserWallet()}
            >Connect</span>
        )
    

    return (
        <>
            <h4 className="info-text">
                <span>Wallet: </span> 
            {
                !isLoading && accountData()
            }
            </h4>
        </>
    )
}

export default ConnectWallet;