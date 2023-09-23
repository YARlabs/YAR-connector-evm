import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetTicker } from "../../hooks/useGetTicker";
import { useGetURI } from "../../hooks/useGetURI";
import { useGetContent } from "../../hooks/useGetContent";
import { idToChainName } from "../../utils/idToChainName";

const ChainIdFromField = () => {
  const { chainIdFrom, token, tokenId } = useTypedSelector(
    (state) => state.main
  );
  const { SetChainIdFrom, SetTicker, SetUri, SetImageLink, SetJsonMetadata } =
    useActions();

  const tickerHook = useGetTicker();
  const uriHook = useGetURI();
  const contentHook = useGetContent();

  const changeChainIdFrom = async (chainId: number) => {
    SetChainIdFrom(chainId);
    if (token.length === 42) {
      const ticker = await tickerHook(token, chainId);
      if (ticker) SetTicker(ticker);
      if (tokenId) {
        const uri = await uriHook(token, tokenId, chainId);
        if (uri) {
          SetUri(uri);
          const jsonContent = await contentHook(uri);
          SetImageLink(jsonContent.image);
          SetJsonMetadata(jsonContent);
        } else {
          SetUri("");
          SetImageLink("");
          SetJsonMetadata("");
        }
      } else {
        SetUri("");
        SetImageLink("");
        SetJsonMetadata("");
      }
    } else {
      SetTicker("");
      SetUri("");
      SetImageLink("");
      SetJsonMetadata("");
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
