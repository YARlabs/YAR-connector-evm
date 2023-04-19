import { useEthers } from "@usedapp/core";

const ConnectWallet = () => {
  const { activateBrowserWallet, account, isLoading } = useEthers();

  const getShortPublicKey = () => `${account}`;

  const accountData = () => {
    if (account)
      return <span style={{ fontWeight: "500" }}>{getShortPublicKey()}</span>;
    return (
      <span
        className="btn btn-danger btn-sm"
        onClick={() => activateBrowserWallet()}
      >
        Connect
      </span>
    );
  };

  return (
    <>
      <h4 className="info-text">
        <span>Wallet: </span>
        {!isLoading && accountData()}
      </h4>
    </>
  );
};

export default ConnectWallet;
