import { useGetTicker } from "../../hooks/useGetTicker";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";

const ContractField = () => {
  const { chainIdFrom, token } = useTypedSelector((state) => state.main);
  const { SetTicker, ClearTicker, SetToken } = useActions();

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
  return (
    <>
      <div className="col-sm-12">
        <div className="form-group label-floating">
          <label className="control-label">Contract:</label>
          <input
            type="text"
            className="form-control"
            defaultValue={token}
            onChange={(e) => setContract(e.target.value)}
          />
          <div>
            {" "}
            (pass 0x0000000000000000000000000000000000000000 to transfer native
            token from original chain)
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractField;
