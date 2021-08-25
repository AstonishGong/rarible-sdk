import { Address } from "@rarible/protocol-api-client"
import { Ethereum } from "@rarible/ethereum-provider"
import { createErc721Contract } from "../order/contracts/erc721"

export async function transferErc721(
	ethereum: Ethereum,
	contract: Address,
	from: Address,
	to: Address,
	tokenId: string,
): Promise<string> {
	const erc721 = createErc721Contract(ethereum, contract)
	const tx = await erc721.functionCall("safeTransferFrom", from, to, tokenId).send()
	return tx.hash
}
