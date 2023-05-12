import { useTypedSelector } from "../../hooks/useTypedSelector";
import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { customIds } from "../../utils/customIds";
import { useActions } from "../../hooks/useActions";

const ChainIdToField = () => {
    const {chainIdTo} = useTypedSelector(state => state.main);
    const {SetChainIdTo} = useActions();

    const ChainsIdTo = [
        ["Polygon", Mumbai.chainId],
        ["BSC", BSCTestnet.chainId],
        ["YAR", customIds.yar],
        ["Ethereum", Goerli.chainId],
        ["Skale", customIds.skale],
    ];

    function changeChainIdTo(id: number) {
        SetChainIdTo(id)
    }

    return (
      <>
        <div className="col-sm-3">
            <div className="form-group label-floating">
                <label className="control-label">To:</label>
                <select
                    className="form-control"
                    onChange={(e) => changeChainIdTo(Number(e.target.value))}
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
      </>
    );
  };
  
export default ChainIdToField;