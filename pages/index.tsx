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
			if(library){
				const bytecode = await library.getCode(contractAddress)
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
		const signer = await provider.getSigner()
		const contractInstance = new ethers.ContractFactory(JSON.parse(abi), bytecode, signer)
		const txHash = await contractInstance.deploy()
		console.log(txHash)
	}
/* 
	return(
		<Fragment>
			<Box h='100vh' bgColor={'whiteAlpha.900'}>
				<Stack>
					<HStack px={{ base: 4, md: 6, lg: 8 }} py={{ base: 4, lg: 8 }} justify={'space-between'}>
						<Heading fontFamily={'Share Tech Mono'} color={'blackAlpha.900'}>portoDapp</Heading>
						{
							account ? 
							<Text>Connected</Text> : 
							<Button onClick={() => activateBrowserWallet()}>Login</Button>
						}
					</HStack>
					<Select placeholder='Select Chain'>
  						<option value='eth' onClick={(e) => setSelectChain('eth')}>Ethereum Mainnet</option>
  						<option value='rinkeby' onClick={(e) => setSelectChain('rinkeby')}>Rinkeby Testnet</option>
  						<option value='kovan' onClick={(e) => setSelectChain('kovan')}>Kovan Testnet</option>
						<option value='polygon' onClick={(e) => setSelectChain('polygon')}>Polygon Mainnet</option>
					</Select>
					<Input placeholder='Contract Address' value={contractAddress} onChange={(e) => setContractAddress(e.target.value)}/>
					<Button onClick={getContractDetails}>Proceed</Button>
				</Stack>
			</Box>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Deploy</ModalHeader>
					<ModalBody>
						<Select placeholder='Select Chain'>
							<option value='bsctest'>Binance Testnet</option>
							<option value='bsc'>Binance Mainnet</option>
						</Select>
						<Input placeholder='Enter Contstructor Params(comma separated)'/>
					</ModalBody>
					<ModalFooter>
						<Button onClick={deployToBSC}>Deploy to Binance Testnet</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Fragment>
	)
	*/
	const [alert, setAlert] = useState('')
    const [currentAccount, setCurrentAccount] = useState('')

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
					<Select>
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
					<Input placeholder='Add Contract Address'/>
					<Select placeholder='Select Deployment Chain'>
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
					>
						Deploy
					</Button>
				</Stack>
			</Box>
		</Fragment>
	)
}


export default Home