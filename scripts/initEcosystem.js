async function init() {
    console.log('starting');
    try {
        console.log('Contract deployment...');
        const artifactsPath = 'browser/contracts/artifacts/GoldBullionNFT.json';
        const abiJson = await remix.call('fileManager', 'getFile', artifactsPath);
        const metadata = JSON.parse(abiJson);

        const provider = new ethers.providers.Web3Provider(web3Provider);
        const signer = provider.getSigner(0)
        const factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer)
        const mainAddress = await signer.getAddress();

        const contract = await factory.deploy()   
        await contract.deployed()

        // add GOLD_KEEPER rights to several accounts
        console.log('grating roles...');
        // goldKeepers = [
        //     '0xf23f09778fFf11fA30FB51dafF211129619e8d40',
        //     '0x44DfB45Cb7a562A94D166BE60130EC57160c3fd4'
        // ]
        // rolesGranted = goldKeepers.map(person => {
        //     // tx = await contract.grantRole('0x3be7b9e88a8ec8233c8a85d8cf6d4ce7df2ac895e9900c1c81f61f28d8c0bd26', person);
        //     contract.grantRole('0x3be7b9e88a8ec8233c8a85d8cf6d4ce7df2ac895e9900c1c81f61f28d8c0bd26', person);
        //     // return tx.wait();
        // })
        // await Promise.all(rolesGranted);
        const txa = await contract.grantRole('0x3be7b9e88a8ec8233c8a85d8cf6d4ce7df2ac895e9900c1c81f61f28d8c0bd26', '0xf23f09778fFf11fA30FB51dafF211129619e8d40');
        const txb = await contract.grantRole('0x3be7b9e88a8ec8233c8a85d8cf6d4ce7df2ac895e9900c1c81f61f28d8c0bd26', '0x44DfB45Cb7a562A94D166BE60130EC57160c3fd4');
        await Promise.all([txa.wait(), txb.wait()]);


        // create tokens with data
        console.log('minting tokens...');
        const imageUrl = 'https://nowszawersja.pages.dev/images?file=8888';
        tokens = [
            {desc: '37.12g;99.99%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 1},
            {desc: '22.00g;99.00%;BTS Premium Bullion;BTS;BTS Jewels Co., Ltd.', id: 2},
            {desc: '100.98g;98.00%;KRU Premium Bullion;KRU;KRU Precious Metals Co., Ltd.', id: 3},
            {desc: '200.98g;97.00%;SRU Premium Bullion;SRU;SRU BOC Bullions Co., Ltd.', id: 4},
            {desc: '124.98g;80.00%;BLU Premium Bullion;BLU;BLU BOC investments Co., Ltd.', id: 5},
            {desc: '321.98g;60.00%;MIH Premium Bullion;MIH;MIH corner shop Co., Ltd.', id: 6},
            {desc: '87.98g;30.00%;KIH Premium Bullion;KIH;KIH private fund Co., Ltd.', id: 7},
        ]
        promiseTxes = tokens.map(async bar => {
            tx = await contract.safeMint(bar.id, bar.desc, imageUrl);
            return tx.wait();
        })
        await Promise.all(promiseTxes);

        // distribute tokens to users
        console.log('token distribution...');
        transfers = [
            {id: 1, from: mainAddress, to: '0x51d7903d39aE5939214f9Fb57036b43366AA537d'},
            {id: 2, from: mainAddress, to: '0x51d7903d39aE5939214f9Fb57036b43366AA537d'},
            {id: 3, from: mainAddress, to: '0x7BA3E64b8Da538AbB7C3Adc72002A2fAF3657d77'},
            {id: 4, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
            {id: 5, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
            {id: 6, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
            {id: 7, from: mainAddress, to: '0x44DfB45Cb7a562A94D166BE60130EC57160c3fd4'},  // My Avacus
        ]
        transferPromises = transfers.map(async bar => {
            tx = await contract.transferFrom(bar.from, bar.to, bar.id);
            return tx.wait();
        })
        await Promise.all(transferPromises);

        console.log('finish!');
    } catch(err) {
        console.log('Error' + err);
    }
}

init();
