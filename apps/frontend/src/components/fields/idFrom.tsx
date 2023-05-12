import { useTypedSelector } from "../../hooks/useTypedSelector";
import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { customIds } from "../../utils/customIds";
import { useActions } from "../../hooks/useActions";
import { useGetTicker } from "../../hooks/useGetTicker";

const ChainIdFromField = () => {
    const {chainIdFrom, token} = useTypedSelector(state => state.main);
    const {SetChainIdFrom, SetTicker} = useActions();

    const ChainsIdFrom = [
        ["BSC", BSCTestnet.chainId],
        ["YAR", customIds.yar],
        ["Polygon", Mumbai.chainId],
        ["Ethereum", Goerli.chainId],
        ["Skale", customIds.skale],
    ];

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
                    {ChainsIdFrom.map((_, i) => (
                    <option key={i + "from"} value={_[1] as number}>
                        {_[0]}
                    </option>
                    ))}
                </select>
            </div>
        </div>
      </>
    );
  };
  
export default ChainIdFromField;