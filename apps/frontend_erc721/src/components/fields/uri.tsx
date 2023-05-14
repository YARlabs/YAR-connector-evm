import { useTypedSelector } from "../../hooks/useTypedSelector";


const UriField = () => {
    const {uri} = useTypedSelector(state => state.main);

    return (
      <>
        {uri ? (<div className="col-sm-12">
            <div className="form-group label-floating">
                <label className="control-label">URI:</label>
                <a
                    className="form-control"
                    href={uri}
                >
                    {uri}
                </a>
            </div>
        </div>) : null} 
      </>
    );
};

export default UriField;