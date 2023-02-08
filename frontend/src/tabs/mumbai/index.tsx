import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { useTransferToInternalBridge } from '../../hooks/useTransferToInternalBridge';
import { useTransferToOtherChain } from '../../hooks/useTransferToOtherChain';
import { useApprove } from '../../hooks/useApprove';
import { BSCTestnet, Goerli, Mumbai, AvalancheTestnet } from "@usedapp/core";
import { idToScanLink } from '../../utils/idToChainName';


const MumbaiTabData = () => {
    const { account } = useEthers();

    const [token, setToken] = useState('');
    const [amount, setAmount] = useState('');
    const [reciever, setReciever] = useState('');
    const [notify, setNotify] = useState('');
    const [chainIdFrom, setChainIdFrom] = useState(0);
    const [chainNameTo, setChainNameTo] = useState('');


    // const InternalTokens = [
    //     ['YAR-MATIC', '1'],
    //     ['YAR-USDC', '0xE097d6B3100777DC31B34dC2c58fB524C2e76921'],
    //     ['YAR-USDT', '2'],
    //     ['YAR-WETH', '3'],
    // ]

    const ChainsIdFrom = [
        ['BSC', BSCTestnet.chainId],
        ['YAR', Goerli.chainId],
        ['Polygon', Mumbai.chainId],
        ['Ethereum', AvalancheTestnet.chainId]
    ]

    const ChainsNameTo = [
        ['Polygon', 'POLYGON'],
        ['BSC', 'BINANCE'],
        ['YAR', 'YAR'],
        ['Ethereum', 'ETHEREUM']
    ]

    useEffect(() => {
        if (!account) return;
        // setToken('0xE097d6B3100777DC31B34dC2c58fB524C2e76921');
        setChainIdFrom(BSCTestnet.chainId);
        setChainNameTo('POLYGON');
        // setAmount('1');
        // setReciever(account);
    }, [account])

    const transferHook = useTransferToOtherChain();
    const transferToBridge = async () => {
        setNotify('');
        const chainId = chainIdFrom;
        
        const tx = await transferHook(token, reciever, Number(amount), chainIdFrom, chainNameTo);
        console.log('tx', tx);
        setNotify(`Transaction: <a href="${idToScanLink[chainId]}${tx?.transactionHash}" target='_blank'>${tx?.transactionHash}</a>`);
    }

    const approveHook = useApprove();
    const Approve = async () => {
        setNotify('');
        const chainId = chainIdFrom;
        const tx = await approveHook(token, chainId);
        console.log('tx', tx);
        setNotify(`Transaction: <a href="${idToScanLink[chainId]}${tx?.transactionHash}" target='_blank'>${tx?.transactionHash}</a>`);
    }

    return (
        <>
            <div className="tab-pane" style={{display: 'block'}}>
                <div className="row">
                    <h5 className='text-center'>
                        <a 
                            href={`https://goerli.etherscan.io/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_YAR}`} 
                            target='_blank'
                            rel="noreferrer"
                        >Contract in YAR</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://mumbai.polygonscan.com/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_POLYGON}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in Polygon</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://testnet.bscscan.com/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_BINANCE}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in BSC</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a 
                            href={`https://testnet.snowtrace.io/address/${process.env.REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_ETHEREUM}`} 
                            target='_blank'
                            rel="noreferrer"
                        >in Ethereum</a>
                    </h5>

                    <div className='col-sm-offset-1'>
                        <div className="col-sm-12">
                            <div className="form-group label-floating">
                                <label className="control-label">Token:</label>
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
                                <label className="control-label">Reciever:</label>
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
                                    {ChainsIdFrom.map((_, i) => <option key={i} value={_[1] as number}>{_[0]}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="form-group label-floating">
                                <label className="control-label">To:</label>
                                <select 
                                    className="form-control" 
                                    onChange={(e) => setChainNameTo(e.target.value)}
                                    defaultValue={chainNameTo}
                                >
                                    {ChainsNameTo.map((_, i) => <option key={i} value={_[1]}>{_[0]}</option>)}
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
                        <input 
                            type='button' 
                            className='btn btn-fill btn-danger btn-wd' 
                            value='Transfer' 
                            onClick={() => transferToBridge()}
                        />
                    </div>

                    <div className="pull-left">
                        <input 
                            type='button' 
                            className='btn btn-fill btn-default btn-wd' 
                            value='Approve' 
                            onClick={() => Approve()}
                        />
                    </div>

                    <div className="clearfix"></div>
                </div>
            </div>

        </>
    )
}

export default MumbaiTabData;