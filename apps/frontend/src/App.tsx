import Main from './page/main';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <>
      <Main />
      <ToastContainer style={{ width: "510px" }}/>
    </>
  );
}

export default App;
