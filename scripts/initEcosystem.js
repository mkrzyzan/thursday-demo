async function init() {
    try {
        const artifactsPath = 'browser/contracts/artifacts/GoldBullionNFT.json';
        const abiJson = await remix.call('fileManager', 'getFile', artifactsPath);
        const metadata = JSON.parse(abiJson);

        const provider = new ethers.providers.Web3Provider(web3Provider);
        const signer = provider.getSigner(0)
        const factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer)
        const mainAddress = await signer.getAddress();

        const contract = await factory.deploy()   
        await contract.deployed()

        // mint 4 tokens, and give them to Olive (0x7BA3E64b8Da538AbB7C3Adc72002A2fAF3657d77)
        const imageUrl = 'https://nowszawersja.pages.dev/images?file=8888';

        tokens = [
            {desc: '37.12g;99.99%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 1},
            {desc: '22.00g;99.00%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 2},
            {desc: '100.98g;98.00%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 3},
            {desc: '200.98g;97.00%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 4},
            {desc: '300.98g;80.00%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 5},
            {desc: '400.98g;80.00%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.', id: 6},
        ]

        promiseTxes = tokens.map(async bar => {
            tx = await contract.safeMint(bar.id, bar.desc, imageUrl);
            return tx.wait();
        })
        await Promise.all(promiseTxes);

        transfers = [
            {id: 1, from: mainAddress, to: '0x51d7903d39aE5939214f9Fb57036b43366AA537d'},
            {id: 2, from: mainAddress, to: '0x51d7903d39aE5939214f9Fb57036b43366AA537d'},
            {id: 3, from: mainAddress, to: '0x7BA3E64b8Da538AbB7C3Adc72002A2fAF3657d77'},
            {id: 4, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
            {id: 5, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
            {id: 6, from: mainAddress, to: '0xf23f09778fFf11fA30FB51dafF211129619e8d40'},  // Masahiro
        ]

        transferPromises = transfers.map(async bar => {
            tx = await contract.transferFrom(bar.from, bar.to, bar.id);
            return tx.wait();
        })
        await Promise.all(transferPromises);

        console.log('finish');
    } catch(err) {
        console.log('Error' + err);
    }
}

init();
