import { useTypedSelector } from "../../hooks/useTypedSelector";
import { BSCTestnet, Goerli, Mumbai } from "@usedapp/core";
import { customIds } from "../../utils/customIds";
import { useActions } from "../../hooks/useActions";
import { useGetURI } from "../../hooks/useGetURI";
import { useGetContent } from "../../hooks/useGetContent";

const ChainIdFromField = () => {
    const {chainIdFrom, token, tokenId} = useTypedSelector(state => state.main);
    const {SetChainIdFrom, SetUri, SetImageLink, SetJsonMetadata} = useActions();

    const ChainsIdFrom = [
        ["BSC", BSCTestnet.chainId],
        ["YAR", customIds.yar],
        ["Polygon", Mumbai.chainId],
        ["Ethereum", Goerli.chainId],
        ["Skale", customIds.skale],
    ];

    const uriHook = useGetURI();
    const contentHook = useGetContent();

    const changeChainIdFrom = async (chainId: number) => {
        SetChainIdFrom(chainId);
        if (token.length === 42) {
            const uri = await uriHook(token, tokenId, chainId);
            if (uri) {
                SetUri(uri);
                const jsonContent = await contentHook(uri);
                SetImageLink(jsonContent.image);
                SetJsonMetadata(jsonContent);
            } else {
                SetUri("");
                SetImageLink("");
                SetJsonMetadata({});
            }
        } else {
            SetUri("");
            SetImageLink("");
            SetJsonMetadata({});
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