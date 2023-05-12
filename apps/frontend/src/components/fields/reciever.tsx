import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";

const RecieverField = () => {
    const {reciever} = useTypedSelector(state => state.main);
    const {SetReciever} = useActions();

    function changeReciever(reciever: string) {
      SetReciever(reciever)
    }

    return (
      <>
        <div className="col-sm-12">
            <div className="form-group label-floating">
            <label className="control-label">Receiver:</label>
            <input
                type="text"
                className="form-control"
                defaultValue={reciever}
                onChange={(e) => changeReciever(e.target.value)}
            />
            </div>
        </div>
      </>
    );
  };
  
export default RecieverField;