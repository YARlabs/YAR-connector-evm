import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTypedSelector } from "../../hooks/useTypedSelector";

const DataTabs = () => {
  const {jsonMetadata, imageLink} = useTypedSelector(state => state.main);
  
  return (
    <>
        <div style={{ visibility: Object.keys(jsonMetadata).length !== 0 ? "visible" : "hidden",
                      height: Object.keys(jsonMetadata).length !== 0 ? "max-content" : "0" }} >
          <div className="wizard-navigation">
            <ul className="nav nav-pills" >
              <li><a href="#image" data-toggle="tab">image</a></li>
              <li><a href="#json" data-toggle="tab">json</a></li>
            </ul> 
          </div>  
          <div className="tab-content" style={{minHeight: "0px"}}>
            <div className="tab-pane" id="image">
              {
                imageLink &&
                <div style={{width: "100%" , display: "flex", justifyContent: "center"}}>
                  <img src={imageLink} alt=""></img>
                </div>
              }
            </div>
            <div className="tab-pane" id="json">
              <SyntaxHighlighter language="json" showLineNumbers style={docco}>
                { JSON.stringify(jsonMetadata, undefined, 4) }
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
    </>
  );
};

export default DataTabs;
