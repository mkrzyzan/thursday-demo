async function init() {
    try {
        const artifactsPath = 'browser/contracts/artifacts/GoldBullionNFT.json';
        const abiJson = await remix.call('fileManager', 'getFile', artifactsPath);
        const metadata = JSON.parse(abiJson);

        const provider = new ethers.providers.Web3Provider(web3Provider);
        const signer = provider.getSigner(0)
        const factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer)

        const contract = await factory.deploy()   
        await contract.deployed()

        // mint 4 tokens, and give them to Olive (0x7BA3E64b8Da538AbB7C3Adc72002A2fAF3657d77)
        const imageUrl = 'https://nowszawersja.pages.dev/images?file=8888';
        const txs = [];
        for (i = 0; i < 4; i++) {
            nftData = `37.${i}g;99.${i}%;MTS Premium Bullion;MTS;MTS Gold Co., Ltd.`;
            tx = await contract.safeMint(i, nftData, imageUrl);
            tx2 = await contract.transferFrom(await signer.getAddress(), '0x7BA3E64b8Da538AbB7C3Adc72002A2fAF3657d77', i);
            txs.push(tx.wait());
            txs.push(tx2.wait());
        }
        Promise.all(txs);

        console.log('finish');
    } catch(err) {
        console.log('Error' + err);
    }
}

init();
