import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { idToChainName } from "../../utils/idToChainName";

const ChainIdToField = () => {
  const { chainIdTo } = useTypedSelector((state) => state.main);
  const { SetChainIdTo } = useActions();

  function changeChainIdTo(id: number) {
    SetChainIdTo(id);
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
            {Object.keys(idToChainName).map((chainId, i) => (
              <option key={i + "to"} value={Number(chainId)}>
                {idToChainName[Number(chainId)]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default ChainIdToField;
