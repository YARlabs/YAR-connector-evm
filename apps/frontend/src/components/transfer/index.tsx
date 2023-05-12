import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useState } from 'react'
import { useTransferToOtherChain } from "../../hooks/useTransferToOtherChain";
import { useGetSecondToken } from "../../hooks/useGetSecondToken";
import { useValidationBeforeTransfer } from "../../hooks/useValidationBeforeTransfer";
import { idToScanLink, idToChainName } from "../../utils/idToChainName";
import { toast } from "react-toastify";

const TransferButton = () => {
    const [isDisable, setDisable] = useState(false);
    const { SetNotify } = useActions();
    const {token, chainIdFrom, chainIdTo, reciever, amount} = useTypedSelector(state => state.main);

    const transferHook = useTransferToOtherChain();
    const getSecondTokenHook = useGetSecondToken();
    const validationHook = useValidationBeforeTransfer();
    
    const transferToBridge = async () => {
        setDisable(true);
        SetNotify("");
        const chainId = chainIdFrom;
        const valid = await validationHook(
            token,
            reciever,
            Number(amount),
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
            Number(amount),
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
        SetNotify(`
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

    return (
      <>
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
      </>
    );
  };
  
export default TransferButton;