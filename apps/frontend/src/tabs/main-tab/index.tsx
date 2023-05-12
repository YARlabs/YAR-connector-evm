import { useEthers } from "@usedapp/core";
import { useEffect } from "react";
import Links from "../../components/links/links";
import ContractField from "../../components/fields/contract";
import ChainIdFromField from "../../components/fields/idFrom";
import ChainIdToField from "../../components/fields/idTo";
import TickerField from "../../components/fields/ticker";
import RecieverField from "../../components/fields/reciever";
import AmountField from "../../components/fields/amount";
import TransferButton from "../../components/transfer";
import { useTypedSelector } from "../../hooks/useTypedSelector";

const MainTab = () => {
  const { account } = useEthers();
  const {notify} = useTypedSelector(state => state.main);

  useEffect(() => {
    if (!account) return;
  }, [account]);

  return (
    <>
      <div className="tab-pane" style={{ display: "block" }}>
        <div className="row">
          <Links/>
          <div className="col-sm-offset">
            <ContractField/>
            <RecieverField />
            <AmountField />
            <TickerField />
            <ChainIdFromField />
            <ChainIdToField />
            {notify ? (
              <div style={{margin: "15px"}} dangerouslySetInnerHTML={{ __html: notify }}></div>
            ) : null}
          </div>
        </div>

        <div className="wizard-footer">
          <div className="pull-right">
            <TransferButton />
          </div>
          <div className="clearfix"></div>
        </div>
      </div>
    </>
  );
};

export default MainTab;
