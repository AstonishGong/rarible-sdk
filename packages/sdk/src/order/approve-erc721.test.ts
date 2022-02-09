import { randomAddress, toAddress } from "@rarible/types"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { Configuration, GatewayControllerApi } from "@rarible/ethereum-api-client"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { getApiConfig } from "../config/api-config"
import { sentTx, getSendWithInjects } from "../common/send-transaction"
import { getEthereumConfig } from "../config"
import { approveErc721 as approveErc721Template } from "./approve-erc721"
import { deployTestErc721 } from "./contracts/test/test-erc721"
import { checkChainId } from "./check-chain-id"

describe("approveErc721", () => {
	const { provider, addresses } = createGanacheProvider()
	const web3 = new Web3(provider as any)
	const ethereum = new Web3Ethereum({ web3 })
	const [from] = addresses
	const configuration = new Configuration(getApiConfig("e2e"))
	const gatewayApi = new GatewayControllerApi(configuration)
	const config = getEthereumConfig("e2e")
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSendWithInjects().bind(null, gatewayApi, checkWalletChainId)

	const approveErc721 = approveErc721Template.bind(null, ethereum, send)

	const it = awaitAll({
		testErc721: deployTestErc721(web3, "TST", "TST"),
	})

	test("should approve", async () => {
		const tokenId = from + "b00000000000000000000001"
		await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: 200000 })

		const operator = randomAddress()
		const tx = await approveErc721( toAddress(it.testErc721.options.address), from, operator)
		await tx?.wait()
		const result: boolean = await it.testErc721.methods.isApprovedForAll(from, operator).call()
		expect(result).toBeTruthy()
	})

	test("should not approve if already approved", async () => {
		const tokenId = from + "b00000000000000000000002"
		await sentTx(it.testErc721.methods.mint(from, tokenId, "https://example.com"), { from, gas: 200000 })

		const operator = randomAddress()
		await sentTx(it.testErc721.methods.setApprovalForAll(operator, true), { from })
		const result = await approveErc721( toAddress(it.testErc721.options.address), from, operator)

		expect(result === undefined).toBeTruthy()
	})
})
