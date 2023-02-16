import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { useTransferToOtherChain } from '../../hooks/useTransferToOtherChain';
import { useGetSecondToken } from '../../hooks/useGetSecondToken';
import { useValidationBeforeTransfer } from '../../hooks/useValidationBeforeTransfer';  
import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { idToScanLink, idToChainName } from '../../utils/idToChainName';
import { toast } from 'react-toastify';

const MumbaiTabData = () => {
    const { account } = useEthers();

    const [token, setToken] = useState('');
    const [amount, setAmount] = useState('');
    const [reciever, setReciever] = useState('');
    const [notify, setNotify] = useState('');
    const [chainIdFrom, setChainIdFrom] = useState(BSCTestnet.chainId);
    const [chainIdTo, setChainIdTo] = useState(Mumbai.chainId);
    const [isDisable, setDisable] = useState(false);

    const ChainsIdFrom = [
        ['BSC', BSCTestnet.chainId],
        ['YAR', 38204],
        ['Polygon', Mumbai.chainId],
        ['Ethereum', Goerli.chainId]
    ]

    const ChainsIdTo = [
        ['Polygon', Mumbai.chainId],
        ['BSC', BSCTestnet.chainId],
        ['YAR', 38204],
        ['Ethereum', Goerli.chainId]
    ]

    useEffect(() => {
        // setChainIdFrom(BSCTestnet.chainId);
        // setChainIdTo(Mumbai.chainId);
        if (!account) return;
        // setToken('0xE097d6B3100777DC31B34dC2c58fB524C2e76921');
        // setAmount('1');
        // setReciever(account);
    }, [account])

    const transferHook = useTransferToOtherChain();
    const getSecondTokenHook = useGetSecondToken();
    const validationHook = useValidationBeforeTransfer();
    const transferToBridge = async () => {
        setDisable(true);
        setNotify('');
        const chainId = chainIdFrom;
        const valid = await validationHook(token, reciever, Number(amount), chainIdFrom, chainIdTo);
        if(!valid) {
            setDisable(false);
            return;
        } 
        const tx = await transferHook(token, reciever, Number(amount), chainIdFrom, chainIdTo);
        const secondToken = await getSecondTokenHook(token, chainIdFrom, chainIdTo);
        console.log('tx', tx);
        toast(`First Token: ${token}; Second Token: ${secondToken}; ${idToChainName[chainIdFrom]} -> ${idToChainName[chainIdTo]} \n `, {
            position: "bottom-left",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "light",
        });
        setNotify(`Transaction: <a href="${idToScanLink[chainId]}tx/${tx?.transactionHash}" target='_blank'>${tx?.transactionHash}</a><br/>
            Second Token: <a href="${idToScanLink[chainIdTo]}address/${secondToken}" target='_blank'>${secondToken}</a><br/>
            ${idToChainName[chainIdFrom]} -> ${idToChainName[chainIdTo]}<br/>
        `);
        setDisable(false);
    }

    return (
        <>
            <div className="tab-pane" style={{display: 'block'}}>
                <div className="row">
                    <h5 className='text-center'>
                        <a 
                            href={`https://mumbai.polygonscan.com/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_POLYGON}`} 
                            target='_blank'
                            rel="noreferrer"
                        >Contract in Polygon</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://testnet.bscscan.com/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_BINANCE}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in BSC</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://goerli.etherscan.io/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_ETHEREUM}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in Ethereum</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://explorer.testnet.yarchain.org/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_YAR}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in YAR</a>
                    </h5>
                    <div className='col-sm-offset-1'>
                        <div className="col-sm-12">
                            <div className="form-group label-floating">
                                <label className="control-label">Contract:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    defaultValue={reciever} 
                                    onChange={(e) => setToken(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="form-group label-floating">
                                <label className="control-label">Receiver:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    defaultValue={reciever} 
                                    onChange={(e) => setReciever(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="col-sm-4">
                            <div className="form-group label-floating">
                                <label className="control-label">Amount:</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    defaultValue={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="form-group label-floating">
                                <label className="control-label">From:</label>
                                <select 
                                    className="form-control" 
                                    onChange={(e) => setChainIdFrom(Number(e.target.value))}
                                    defaultValue={chainIdFrom}
                                >
                                    {ChainsIdFrom.map((_, i) => <option key={i + 'from'} value={_[1] as number}>{_[0]}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="form-group label-floating">
                                <label className="control-label">To:</label>
                                <select 
                                    className="form-control" 
                                    onChange={(e) => setChainIdTo(Number(e.target.value))}
                                    defaultValue={chainIdTo}
                                >
                                    {ChainsIdTo.map((_, i) => <option key={i + 'to'} value={_[1] as number}>{_[0]}</option>)}
                                </select>
                            </div>
                        </div>

                        {
                            notify ?    
                                <div dangerouslySetInnerHTML={{ __html: notify }}></div> 
                            : 
                                null
                        }

                    </div>

                </div>
                
                <div className="wizard-footer">
                    <div className="pull-right">
                        
                        <button
                            type='button' 
                            className='btn btn-fill btn-danger btn-wd' 
                            value='Transfer' 
                            onClick={() => transferToBridge()}
                            disabled={isDisable}
                            style={{height: '42px'}}
                        >
                            {
                                isDisable ?  <div className="spinner"></div> : "Transfer"
                            }    
                        </button>
                    </div>

                    <div className="clearfix"></div>
                </div>
            </div>

        </>
    )
}

export default MumbaiTabData;