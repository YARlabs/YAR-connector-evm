import { BRIDGES_ADDRESSES } from "configs";
import { bridgesLinks } from "../../utils/bridgesLinks";

const Links = () => {
  
  return (
    <>
        <h5 className="text-center">
            <div
              className="btn btn-fill btn-danger btn-wd"
              style={{cursor: "default"}}
            >
              ERC20
            </div>
            <a
              className="btn btn-fill btn-default btn-wd"
              href={bridgesLinks.erc721}
              rel="noreferrer"
            >
              ERC721
            </a>
            <a
              className="btn btn-fill btn-default btn-wd"
              href={bridgesLinks.erc1155}
              rel="noreferrer"
            >
              ERC1155
            </a>
        </h5>
        <h5 className="text-center">
            <a
              href={`https://mumbai.polygonscan.com/address/${BRIDGES_ADDRESSES.erc20.polygonTest}`}
              target="_blank"
              rel="noreferrer"
            >
              Contract in Polygon
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`https://testnet.bscscan.com/address/${BRIDGES_ADDRESSES.erc20.binanceTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in BSC
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`https://goerli.etherscan.io/address/${BRIDGES_ADDRESSES.erc20.ethereumTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Ethereum
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`https://explorer.testnet.yarchain.org/address/${BRIDGES_ADDRESSES.erc20.yarTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in YAR
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com/address/${BRIDGES_ADDRESSES.erc20.chaosSkaleTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in SKALE
            </a>
        </h5>
    </>
  );
};

export default Links;