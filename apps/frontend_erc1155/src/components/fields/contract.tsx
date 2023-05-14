import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useGetContent } from "../../hooks/useGetContent";
import { useGetURI } from "../../hooks/useGetURI";

const ContractField = () => {
    const {chainIdFrom, token, tokenId} = useTypedSelector(state => state.main);
    const {SetToken, SetUri, SetImageLink, SetJsonMetadata} = useActions();

    const contentHook = useGetContent();
    const uriHook = useGetURI();

    const setContract = async (address: string) => {
        SetToken(address);
        if (address.length === 42) {
          const uri = await uriHook(address, tokenId, chainIdFrom);
          if (uri) {
            SetUri(uri);
            const jsonContent = await contentHook(uri);
            SetJsonMetadata(jsonContent);
            SetImageLink(jsonContent.image);
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