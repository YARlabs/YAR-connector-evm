import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";

const AmountField = () => {
    const {amount} = useTypedSelector(state => state.main);
    const {SetAmount} = useActions();

    function changeAmount(amount: string) {
      SetAmount(amount);
    }

    return (
      <>
        <div className="col-sm-3">
            <div className="form-group label-floating">
            <label className="control-label">Amount:</label>
            <input
                type="number"
                className="form-control"
                defaultValue={amount}
                onChange={(e) => changeAmount(e.target.value)}
            />
            </div>
        </div>
      </>
    );
  };
  
export default AmountField;