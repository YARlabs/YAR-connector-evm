import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetTicker } from "../../hooks/useGetTicker";
import { idToChainName } from "../../utils/idToChainName";

const ChainIdFromField = () => {
    const {chainIdFrom, token} = useTypedSelector(state => state.main);
    const {SetChainIdFrom, SetTicker} = useActions();

    const tickerHook = useGetTicker();
    const changeChainIdFrom = async (chainId: number) => {        
        SetChainIdFrom(chainId);
        if (token.length === 42) {
          const ticker = await tickerHook(token, chainId);
          if (ticker) {SetTicker(ticker)}
          else { SetTicker("") } ;
        } else {
          SetTicker("");
        }
    };

    return (
      <>
        <div className="col-sm-3">
            <div className="form-group label-floating">
                <label className="control-label">From:</label>
                <select
                    className="form-control"
                    onChange={(e) => changeChainIdFrom(Number(e.target.value))}
                    defaultValue={chainIdFrom}
                >
                    {Object.keys(idToChainName).map((chainId, i) => (
                    <option key={i + "from"} value={Number(chainId)}>
                        {idToChainName[Number(chainId)]}
                    </option>
                    ))}
                </select>
            </div>
        </div>
      </>
    );
  };
  
export default ChainIdFromField;