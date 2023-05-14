import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Config, DAppProvider, Mumbai, Goerli, BSCTestnet } from "@usedapp/core";
import { config } from './config';
import { customIds } from "./utils/customIds";
import { Provider } from 'react-redux';
import { store } from './store';

const DAppConfig: Config = {
  readOnlyChainId: Mumbai.chainId,
  readOnlyUrls: {
    [Mumbai.chainId]: config.network.mumbai.url,
    [Goerli.chainId]: config.network.goerli.url,
    [BSCTestnet.chainId]: config.network.bsctestnet.url,
    [customIds.yar]: config.network.yar.url,
    [customIds.skale]: config.network.skale.url
  },
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