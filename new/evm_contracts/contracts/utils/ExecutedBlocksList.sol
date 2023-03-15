// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;


contract ExecutedBlocksList {
    mapping(uint256 => uint256) executedBlocksList;
    uint256 executedBlocksListLength;

    function addExecutedBlock() internal {
        uint256 length = executedBlocksListLength;
        if(executedBlocksList[length] != block.number) {
            executedBlocksList[length] = block.number
            executedBlocksListLength++;
        }
    }

    function getExecutedBlocks(uint256 _page, uint256 _count) external view returns (uint256[] memory, bool) {
        uint256 start = _page * _count;
        uint256 end = start + count;
        uint256 length = _count;
        bool hasMore = true;

        if(end >= executedBlocksListLength) {
            end = executedBlocksListLength;
            length = end - start;
            hasMore = false;
        }
        
        uint256 memory result = new uint256[](length)
        for(uint256 i = start; i < end; i++) {
            result[i] = executedBlocksList[i];
        }

        return (
            result,
            hasMore
        )
    }
}
