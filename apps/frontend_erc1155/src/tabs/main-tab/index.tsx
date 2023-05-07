import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { useTransferToOtherChain } from "../../hooks/useTransferToOtherChain";
import { useGetSecondToken } from "../../hooks/useGetSecondToken";
import { useValidationBeforeTransfer } from "../../hooks/useValidationBeforeTransfer";
import { useGetURI } from "../../hooks/useGetURI";
import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { idToScanLink, idToChainName } from "../../utils/idToChainName";
import { toast } from "react-toastify";
import { customIds } from "../../utils/customIds";
import { useGetContent } from "../../hooks/useGetContent";
import 'react-json-view-lite/dist/index.css';
import Links from "../../components/links/links";
import DataTabs from "../../components/data-tabs/tabs";

const MainTab = () => {
  const { account } = useEthers();

  const [token, setToken] = useState("");
  const [id, setId] = useState("");
  const [amount, setAmount] = useState("");
  const [reciever, setReciever] = useState("");
  const [notify, setNotify] = useState("");
  const [uri, setUri] = useState("");
  const [chainIdFrom, setChainIdFrom] = useState(BSCTestnet.chainId);
  const [chainIdTo, setChainIdTo] = useState(Mumbai.chainId);
  const [isDisable, setDisable] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [jsonMetadata, setJsonMetadata] = useState({});

  const ChainsIdFrom = [
    ["BSC", BSCTestnet.chainId],
    ["YAR", customIds.yar],
    ["Polygon", Mumbai.chainId],
    ["Ethereum", Goerli.chainId],
    ["Skale", customIds.skale],
  ];

  const ChainsIdTo = [
    ["Polygon", Mumbai.chainId],
    ["BSC", BSCTestnet.chainId],
    ["YAR", customIds.yar],
    ["Ethereum", Goerli.chainId],
    ["Skale", customIds.skale],
  ];

  useEffect(() => {
    if (!account) return;
  }, [account]);

  const contentHook = useGetContent();
  const uriHook = useGetURI();
  const transferHook = useTransferToOtherChain();
  const getSecondTokenHook = useGetSecondToken();
  const validationHook = useValidationBeforeTransfer();
  const transferToBridge = async () => {
    setDisable(true);
    setNotify("");
    const chainId = chainIdFrom;    
    const valid = await validationHook(
      token,
      reciever,
      id,
      amount,
      chainIdFrom,
      chainIdTo
    );
    if (!valid) {
      setDisable(false);
      return;
    }
    const tx = await transferHook(
      token,
      reciever,
      id,
      amount,
      chainIdFrom,
      chainIdTo
    );
    const secondToken = await getSecondTokenHook(token, chainIdFrom, chainIdTo);
    console.log("tx", tx);
    toast(
      `First Token: ${"      "}${token};${"      "}Target Token: ${"  "}${secondToken};${"      "} from ${
        idToChainName[chainIdFrom]
      } to ${idToChainName[chainIdTo]} \n `,
      {
        position: "bottom-left",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light",
      }
    );
    setNotify(`
            <table>
                <tr>
                    <td>Transaction:</td>
                    <td><a href="${idToScanLink[chainId]}tx/${tx?.transactionHash}" target='_blank'>${tx?.transactionHash}</a></td>
                </tr>
                <tr>
                    <td>Target Token:&nbsp;&nbsp;</td>
                    <td><a href="${idToScanLink[chainIdTo]}address/${secondToken}" target='_blank'>${secondToken}</a></td>
                </tr>
                <tr>
                    <td>from ${idToChainName[chainIdFrom]}&nbsp;&nbsp;</td>
                    <td>to ${idToChainName[chainIdTo]}</td>
                </tr>
            </table>
        `);
    setDisable(false);
  };

  const setContract = async (address: string) => {
    setToken(address);
    if (address.length === 42) {
      const uri = await uriHook(address, id, chainIdFrom);
      if (uri) {
        setUri(uri);
        const jsonContent = await contentHook(uri);
        setJsonMetadata(jsonContent);
        setImageLink(jsonContent.image);
      } else {
        setUri("");
        setImageLink("");
        setJsonMetadata({});
      }
    } else {
      setUri("");
      setImageLink("");
      setJsonMetadata({});
    }
  };

  const changeChainIdFrom = async (chainId: number) => {
    setChainIdFrom(chainId);
    if (token.length === 42) {
        const uri = await uriHook(token, id, chainId);
        if (uri) {
          setUri(uri);
          const jsonContent = await contentHook(uri);
          setImageLink(jsonContent.image);
          setJsonMetadata(jsonContent);
        } else {
          setUri("");
          setImageLink("");
          setJsonMetadata({});
        }
    } else {
      setUri("");
      setImageLink("");
      setJsonMetadata({});
    }
  };

  const changeNftId = async (nftId: string) => {
    setId(nftId);
    if (token.length === 42) {
      const uri = await uriHook(token, nftId, chainIdFrom);
      if (uri) {
        setUri(uri);
        const jsonContent = await contentHook(uri);
        setImageLink(jsonContent.image);
        setJsonMetadata(jsonContent);
      } else {
        setUri("");
        setImageLink("");
        setJsonMetadata({});
      }
    }
  }

  return (
    <>
      <div className="" style={{ display: "block" }}>
        <div className="row" style={{padding: "30px"}}>
          <Links/>
          <div className="col-sm-offset">
            <div className="col-sm-12">
              <div className="form-group label-floating">
                <label className="control-label">Contract:</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={reciever}
                  onChange={(e) => setContract(e.target.value)}
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

            <div className="col-sm-3">
              <div className="form-group label-floating">
                <label className="control-label">Id:</label>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={id}
                  onChange={(e) => changeNftId(e.target.value)}
                />
              </div>
            </div>

            <div className="col-sm-3">
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

            <div className="col-sm-3">
              <div className="form-group label-floating">
                <label className="control-label">From:</label>
                <select
                  className="form-control"
                  onChange={(e) => changeChainIdFrom(Number(e.target.value))}
                  defaultValue={chainIdFrom}
                >
                  {ChainsIdFrom.map((_, i) => (
                    <option key={i + "from"} value={_[1] as number}>
                      {_[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-sm-3">
              <div className="form-group label-floating">
                <label className="control-label">To:</label>
                <select
                  className="form-control"
                  onChange={(e) => setChainIdTo(Number(e.target.value))}
                  defaultValue={chainIdTo}
                >
                  {ChainsIdTo.map((_, i) => (
                    <option key={i + "to"} value={_[1] as number}>
                      {_[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {uri ? (<div className="col-sm-12">
              <div className="form-group label-floating">
                <label className="control-label">URI:</label>
                <a
                  className="form-control"
                  href={uri}
                >
                  {uri}
                </a>
              </div>
            </div>) : null}

            {notify ? (
              <div style={{margin: "15px"}} dangerouslySetInnerHTML={{ __html: notify }}></div>
            ) : null}
          </div>
        </div>

        <DataTabs metaData={jsonMetadata} image={imageLink} />     
        

        <div className="wizard-footer">
        { token  && reciever && 
          id && amount &&
          <div className="pull-right">
            <button
              type="button"
              className="btn btn-fill btn-danger btn-wd"
              value="Transfer"
              onClick={() => transferToBridge()}
              disabled={isDisable}
              style={{ height: "42px" }}
            >
              {isDisable ? <div className="spinner"></div> : "Transfer"}
            </button>
          </div>
        }
          <div className="clearfix"></div>
        </div>
      </div>
    </>
  );
};

export default MainTab;
