import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Config, DAppProvider, Goerli, Mumbai } from "@usedapp/core";
import { config } from './config';

const DAppConfig: Config = {
  readOnlyChainId: Mumbai.chainId,// Goerli.chainId,
  readOnlyUrls: {
    // [Goerli.chainId]: config.network.goerli.url,
    [Mumbai.chainId]: config.network.mumbai.url,
  },
};

const root = ReactDOM.createRoot(
  document.querySelector("#root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DAppProvider config={DAppConfig}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);