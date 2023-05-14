import { useTypedSelector } from "../../hooks/useTypedSelector";

const TickerField = () => {
    const {ticker} = useTypedSelector(state => state.main);
    return (
      <>
        <div className="col-sm-3">
          <div className="form-group label-floating">
            <label className="control-label">Ticker:</label>
            <div className="form-control">{ticker ? ticker : "-"}</div>
          </div>
        </div>
      </>
    );
  };

  export default TickerField;