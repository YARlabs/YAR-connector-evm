import { useGetTicker } from "../../hooks/useGetTicker";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetContent } from "../../hooks/useGetContent";
import { useGetURI } from "../../hooks/useGetURI";

const ContractField = () => {
    const {chainIdFrom, token, tokenId} = useTypedSelector(state => state.main);
    const {SetTicker, SetToken, SetUri, SetImageLink, SetJsonMetadata} = useActions();

    const tickerHook = useGetTicker();
    const contentHook = useGetContent();
    const uriHook = useGetURI();

    const setContract = async (address: string) => {
        SetToken(address);
        if (address.length === 42) {
            const ticker = await tickerHook(address, chainIdFrom);
            if (ticker) SetTicker(ticker);
            if (tokenId) {
                const uri = await uriHook(address, tokenId, chainIdFrom);
                if (uri) {
                    SetUri(uri);
                    const jsonContent = await contentHook(uri);
                    SetJsonMetadata(jsonContent);
                    SetImageLink(jsonContent.image);
                } 
            } else {
                SetUri("")
                SetImageLink("");
                SetJsonMetadata({});
            }
        } else {
            SetTicker("");
            SetUri("");
            SetImageLink("");
            SetJsonMetadata({});
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
            </div>
        </div>
      </>
    );
  };

  export default ContractField;