import { Box, HStack, Stack, Heading, Button, Text, Select, Input } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import type { NextPage } from 'next'
import { Fragment, useState } from 'react'
import { useMoralis } from 'react-moralis'
import axios from 'axios'

const Home: NextPage = () => {	
	const { activateBrowserWallet, account, chainId, library } = useEthers()
	
	// const { authenticate, isAuthenticated, user, account, chainId } = useMoralis()
	const [ contractAddress, setContractAddress ] = useState('')
	const [ selectChain, setSelectChain ] = useState('')
	const [ abi, setAbi ] = useState('')
	const [ bytecode, setBytecode ] = useState('')
	
	const etherscanApi = `https://api.etherscan.com/api?module=contract&action=getsourcecode`
	const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

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
			}
		}
		catch(err){
			console.log(err)
		}
		// Get contract ABI, detect smart contract params and store abi in a state var
		const res = await axios.get(
			`${etherscanApi}&address=${contractAddress}&apiKey=${apiKey}`
		)
		console.log(res.data.result[0])
	}

	return(
		<Fragment>
			<Box h='100vh' bgColor={'whiteAlpha.900'}>
				<Stack>
					<HStack px={{ base: 4, md: 6, lg: 8 }} py={{ base: 4, lg: 8 }} justify={'space-between'}>
						<Heading fontFamily={'Share Tech Mono'} color={'blackAlpha.900'}>portoDapp</Heading>
						{
							account ? <Text>Connected</Text> : <Button onClick={() => activateBrowserWallet()}>Login</Button>
						}
					</HStack>
					<Select placeholder='Select Chain'>
  						<option value='eth' onClick={(e) => setSelectChain('eth')}>Ethereum Mainnet</option>
  						<option value='rinkeby' onClick={(e) => setSelectChain('rinkeby')}>Rinkeby Testnet</option>
  						<option value='kovan' onClick={(e) => setSelectChain('kovan')}>Kovan Testnet</option>
						<option value='polygon' onClick={(e) => setSelectChain('polygon')}>Polygon Testnet</option>
					</Select>
					<Input placeholder='Contract Address' value={contractAddress} onChange={(e) => setContractAddress(e.target.value)}/>
					<Input placeholder='Add Constructor Params (comma separated)'/>
					<Button onClick={getContractDetails}>Get Contract</Button>
				</Stack>
			</Box>
		</Fragment>
	)
}

export default Home