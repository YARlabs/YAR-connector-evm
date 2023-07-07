import { BRIDGES_ADDRESSES, CHAINS_CONFIG } from "configs";
import { bridgesLinks } from "../../utils/bridgesLinks";

const Links = () => {
  
  return (
    <>
        <h5 className="text-center">
            <a
              className="btn btn-fill btn-default btn-wd"
              href={bridgesLinks.erc20}
              rel="noreferrer"
            >
              ERC20
            </a>
            <a
              className="btn btn-fill btn-default btn-wd"
              href={bridgesLinks.erc721}
              rel="noreferrer"
            >
              ERC721
            </a>
            <div
              className="btn btn-fill btn-danger btn-wd"
              style={{cursor: "default"}}
            >
              ERC1155
            </div>
        </h5>
        <h5 className="text-center">
            <a
              href={`${CHAINS_CONFIG.polygonTest.explorer}/address/${BRIDGES_ADDRESSES.erc1155.polygonTest}`}
              target="_blank"
              rel="noreferrer"
            >
              Contract in Polygon
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.binanceTest.explorer}/address/${BRIDGES_ADDRESSES.erc1155.binanceTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in BSC
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.ethereumTest.explorer}/address/${BRIDGES_ADDRESSES.erc1155.ethereumTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in Ethereum
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.yarTest.explorer}/address/${BRIDGES_ADDRESSES.erc1155.yarTest}`}
              target="_blank"
              rel="noreferrer"
            >
              in YAR
            </a>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a
              href={`${CHAINS_CONFIG.chaosSkaleTest.explorer}/address/${BRIDGES_ADDRESSES.erc1155.chaosSkaleTest}`}
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
