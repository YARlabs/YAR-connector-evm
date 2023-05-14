import { useState } from 'react';
import { idToScanLink, idToChainName } from "../../utils/idToChainName";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetSecondToken } from '../../hooks/useGetSecondToken';
import { useValidationBeforeTransfer } from '../../hooks/useValidationBeforeTransfer';
import { useTransferToOtherChain } from '../../hooks/useTransferToOtherChain';
import { toast } from "react-toastify";

const TransferButton = () => {
    const {token, reciever, tokenId, chainIdFrom, chainIdTo} = useTypedSelector(state => state.main);
    const { SetNotify } = useActions();
    const [isDisable, setDisable] = useState(false);

    const getSecondTokenHook = useGetSecondToken();
    const validationHook = useValidationBeforeTransfer();
    const transferHook = useTransferToOtherChain();

    const transferToBridge = async () => {
        setDisable(true);
        SetNotify("");
        const chainId = chainIdFrom;
        const valid = await validationHook(
          token,
          reciever,
          tokenId,
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
          tokenId,
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