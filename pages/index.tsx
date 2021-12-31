import { 
	Box, 
	HStack, 
	Stack, 
	Heading, 
	Button, 
	Text, 
	Select, 
	Input, 
	Modal,
	ModalOverlay,
	ModalBody,
	ModalHeader,
	ModalFooter,
	useDisclosure, 
	ModalContent,
	Alert,
	AlertIcon,
	AlertTitle,
	VStack,
	Center
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import type { NextPage } from 'next'
import { Fragment, useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'
import axios from 'axios'
import { ethers } from 'ethers'
import { chains } from '../chains'

const Home: NextPage = () => {	

	const { activateBrowserWallet, account, chainId, library } = useEthers()
	const { onOpen, onClose, isOpen } = useDisclosure()
	// const { authenticate, isAuthenticated, user, account, chainId } = useMoralis()
	const [ contractAddress, setContractAddress ] = useState('')
	const [ selectChain, setSelectChain ] = useState('')
	const [ abi, setAbi ] = useState('')
	const [ bytecode, setBytecode ] = useState('')
	const [ src, setSrc ] = useState('')
	const [alert, setAlert] = useState('')
    const [currentAccount, setCurrentAccount] = useState('')
	
	const etherscanApi = `https://api.etherscan.com/api?module=contract&action=getsourcecode`
	const etherScanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

	const polygonApi = `https://api.polygonscan.com/api?module=contract&action=getsourcecode`
	const polygonScanApiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY

	const getContractDetails = async () => {
		/* 
			If network is same as chainID, init a jsonWebProvider
			eth.getCode -> returns bytecode
			store bytecode in a state var.	
		*/

		console.log('Executing function call')
		try {
			// @ts-ignore
			const provider = new ethers.providers.Web3Provider(window.ethereum)	
			const bytecode = await provider.getCode(contractAddress)
			setBytecode(bytecode)
			console.log(bytecode.toString())
			// Get contract ABI, detect smart contract params and store abi in a state var
			const res = await axios.get(
				`${polygonApi}&address=${contractAddress}&apiKey=${polygonScanApiKey}`
			)
			setSrc(res.data.result[0].SourceCode)
			setAbi(res.data.result[0].ABI)
			console.log(getConstructorParams(res.data.result[0].ABI))
			// opens the modal
			onOpen()
		}
		catch(err){
			console.log(err)
		}
	}

	const getConstructorParams = (abi: string) => {
		return JSON.parse(abi)[0].inputs.length
	}

	const deployToBSC = async () => {
		if(chainId !== parseInt("97", 16)){
			// @ts-ignore
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
    			params: [{ chainId: '0x61' }],
			})
		}
		console.log(JSON.parse(abi))
		// @ts-ignore
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contractInstance = new ethers.ContractFactory(JSON.parse(abi), bytecode, signer)
		const txHash = await contractInstance.deploy()
		console.log(txHash)
	}
	
	useEffect(() => {
		// @ts-ignore
		if(typeof window.ethereum === 'undefined'){
			setAlert('Kindly install metamask to get started.')		
		}
	}, [])

	const requestAccounts = async () => {
		// @ts-ignore
		const accounts: Array<string> = await window.ethereum.request({
			method: 'eth_requestAccounts'
		})
		setCurrentAccount(accounts[0])
	}

	const shortenAccount = async (account: string) => {
		return `${account.substring(0,5)}...${account.substring(37)}`
	}

	return(
		<Fragment>
			<Box h={'100vh'} bgColor={'whiteAlpha.900'}>
				{
					alert && 
					<Alert status='error'>
						<AlertIcon/>
						<AlertTitle>{alert}</AlertTitle>
					</Alert>
				}
				<HStack p={8} justify={'space-between'}>
					<Heading>portoDapp</Heading>
					{
						currentAccount ? 
						<Text>{currentAccount.substring(0,5)}...{currentAccount.substring(37)}</Text> :
						<Button onClick={requestAccounts}>connect wallet</Button>
					}
				</HStack>
				<Stack px={8} py={4}>
					<Text>FROM:</Text>
					<Select onChange={(e) => setSelectChain(e.target.value)}>
						{
							chains.map(chain => {
								return(
									<option value={chain.chainId}>
										{chain.chain}
									</option>
								)
							})
						}
					</Select>
					<Input 
						placeholder='Add Contract Address' 
						value={contractAddress} 
						onChange={(e) => setContractAddress(e.target.value)}
					/>
					<Text pt={4}>Select Deployment Chain:</Text>
					<Select value={selectChain}>
						{
							chains.map(chain => {
								return(
									<option value={chain.chainId}>
										{chain.chain}
									</option>
								)
							})
						}
					</Select>
					<Button 
						bgColor={'blackAlpha.900'} 
						color={'whiteAlpha.900'} 
						colorScheme={'blackAlpha'}
						onClick={getContractDetails}
					>
						Deploy
					</Button>
				</Stack>
			</Box>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Final Step</ModalHeader>
					<ModalBody>
						<Input placeholder='Enter Contstructor Params(comma separated)'/>
					</ModalBody>
					<ModalFooter>
						<Button onClick={deployToBSC}>Deploy to Binance Testnet</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Fragment>
	)
}


export default Home