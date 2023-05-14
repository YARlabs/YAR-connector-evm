import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetURI } from "../../hooks/useGetURI";
import { useGetContent } from "../../hooks/useGetContent";

const TokenIdField = () => {
    const {tokenId, token, chainIdFrom} = useTypedSelector(state => state.main);
    const {SetTokenId, SetUri, SetImageLink, SetJsonMetadata} = useActions();

    const uriHook = useGetURI();
    const contentHook = useGetContent();

    const changeNftId = async (nftId: string) => {
        SetTokenId(nftId);
        if (token.length === 42) {
          const uri = await uriHook(token, nftId, chainIdFrom);
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
        }
      }

    return (
      <>
        <div className="col-sm-3">
            <div className="form-group label-floating">
                <label className="control-label">Id:</label>
                <input
                    type="number"
                    className="form-control"
                    defaultValue={tokenId}
                    onChange={(e) => changeNftId(e.target.value)}
                />
            </div>
        </div>
      </>
    );
};

export default TokenIdField;