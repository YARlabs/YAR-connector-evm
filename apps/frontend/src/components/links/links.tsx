import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs";
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
              href={`${CHAINS_CONFIG.polygonTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.polygonTest}`}
              target="_blank"
              rel="noreferrer"
            >
              Contract in Polygon
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.binanceTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.binanceTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in BSC
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.ethereumTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.ethereumTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Ethereum
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.yarTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.yarTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in YAR
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.chaosSkaleTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.chaosSkaleTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in SKALE
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.optimismTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.optimismTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Optimism
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.arbitrumTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.arbitrumTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Arbitrum
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.avaxTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.avaxTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Avalanche
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.baseTest.explorer}/address/${BRIDGES_ADDRESSES.erc20.baseTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in BASE
            </a>
        </h5>
    </>
  );
};

export default Links;
