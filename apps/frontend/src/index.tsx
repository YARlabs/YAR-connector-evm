import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Config, DAppProvider, Mumbai, Goerli, BSCTestnet } from "@usedapp/core";
import { config } from './config';
import { Provider } from 'react-redux';
import { store } from './store';
import { idToRpcUrl } from "./utils/idToChainName";

const DAppConfig: Config = {
  readOnlyChainId: Mumbai.chainId,
  readOnlyUrls: JSON.parse(JSON.stringify(idToRpcUrl)), // copy
};

const root = ReactDOM.createRoot(
  document.querySelector("#root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DAppProvider config={DAppConfig}>
      <Provider store={store}>
        <App />
      </Provider>
    </DAppProvider>
  </React.StrictMode>
);