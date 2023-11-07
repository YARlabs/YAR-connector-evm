import { useGetTicker } from "../../hooks/useGetTicker";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useState } from "react";


const tickers = {

}

const ContractField = () => {
  const { chainIdFrom, token } = useTypedSelector((state) => state.main);
  const { SetTicker, ClearTicker, SetToken } = useActions();

  const [type, setType] = useState("erc20");

  const tickerHook = useGetTicker();
  const setContract = async (address: string) => {
    SetToken(address);
    if (address.length === 42) {
      const ticker = await tickerHook(address, chainIdFrom);
      if (ticker) SetTicker(ticker);
    } else {
      ClearTicker();
    }
  };

  const setContractType = async (type: "native" | "erc20") => {
    if (type == "native") {
      setType("native");
      setContract("0x0000000000000000000000000000000000000000");
    } else if (type == "erc20") {
      setType("erc20");
      setContract("");
    }
  };

  return (
    <>
      <div className="col-sm-12">
        <div>
          Token type:<span> </span>
          <div
            className="btn btn-xs"
            onClick={() => setContractType("erc20")}
            style={{backgroundColor: type == 'erc20' ? '#f44336' : '#999999'}}
          >
            Contract
          </div>

          <div
            className="btn btn-xs"
            onClick={() => setContractType("native")}
            style={{backgroundColor: type == 'native' ? '#f44336' : '#999999'}}
          >
            Native
          </div>
        </div>
        {type == "erc20" && (
          <div className="form-group label-floating">
            <label className="control-label">Contract:</label>
            <input
              type="text"
              className="form-control"
              defaultValue={token}
              onChange={(e) => setContract(e.target.value)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ContractField;
