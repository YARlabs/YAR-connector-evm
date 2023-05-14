import { useEthers } from "@usedapp/core";
import { useEffect } from "react";
import 'react-json-view-lite/dist/index.css';
import Links from "../../components/links/links";
import DataTabs from "../../components/data-tabs/tabs";
import TransferButton from "../../components/transfer"
import { useTypedSelector } from "../../hooks/useTypedSelector";
import ContractField from "../../components/fields/contract";
import RecieverField from "../../components/fields/reciever";
import TokenIdField from "../../components/fields/tokenId";
import AmountField from "../../components/fields/amount";
import ChainIdFromField from "../../components/fields/idFrom";
import ChainIdToField from "../../components/fields/idTo";
import UriField from "../../components/fields/uri";

const MainTab = () => {
  const { account } = useEthers();
  const {token, reciever, tokenId, notify, amount } = useTypedSelector(state => state.main);

  useEffect(() => {
    if (!account) return;
  }, [account]);

  return (
    <>
      <div className="" style={{ display: "block" }}>
        <div className="row" style={{padding: "30px"}}>
          <Links/>
          <div className="col-sm-offset">
            <ContractField />
            <RecieverField />
            <TokenIdField />
            <AmountField />
            <ChainIdFromField />
            <ChainIdToField />
            <UriField />
            {notify ? (
              <div style={{margin: "15px"}} dangerouslySetInnerHTML={{ __html: notify }}></div>
            ) : null}
          </div>
        </div>
        <DataTabs />     
        <div className="wizard-footer">
        { token  && reciever && 
          tokenId && amount &&
          <div className="pull-right">
            <TransferButton />
          </div>
        }
          <div className="clearfix"></div>
        </div>
      </div>
    </>
  );
};

export default MainTab;
