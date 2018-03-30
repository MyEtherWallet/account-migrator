const Web3 = require('web3')
const fetch = require('node-fetch')
const ERC20_ABI = require('./ABI/erc20.json')
const ethUtils = require('ethereumjs-util')
const config = require('./config')
const FROM_PRIVKEY = config.FROM_PRIV_KEY
const TO = config.TO
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.RPC_HOST))
async function run() {
    const response = await fetch(config.TOKEN_PATH)
    const tokens = await response.json()
    migrate(tokens);
}
async function isValidTokenContract(addr) {
    let _t = new web3.eth.Contract(ERC20_ABI, addr)
    try {
        await _t.methods.totalSupply().call()
        return true
    } catch (e) {
        return false
    }
}
async function migrate(tokens) {
    const FROM = '0x' + ethUtils.privateToAddress(FROM_PRIVKEY).toString('hex')
    let txCount = await web3.eth.getTransactionCount(FROM)
    for (let i = 0; i < tokens.length; i++) {
        const _token = tokens[i]
        const isValid = await isValidTokenContract(_token.address)
        if (isValid) {
            let _t = new web3.eth.Contract(ERC20_ABI, _token.address)
            let balance = await _t.methods.balanceOf(FROM).call()
            if (balance > 0) {
                await (async() => {
                    return _t.methods.transfer(TO, balance).estimateGas({
                        gas: 500000,
                        from: FROM
                    }).then((gasAmount) => {
                        return web3.eth.accounts.signTransaction({
                            to: _token.address,
                            value: 0,
                            gas: gasAmount,
                            nonce: txCount,
                            gasPrice: config.GAS_PRICE,
                            data: _t.methods.transfer(TO, balance).encodeABI()
                        }, FROM_PRIVKEY).then((signed) => {
                            return new Promise((resolve, reject) => {
                                web3.eth.sendSignedTransaction(signed.rawTransaction)
                                    .on('transactionHash', (hash) => {
                                        console.log("Token", hash)
                                        txCount++
                                        resolve()
                                    }).catch((e) => {
                                        console.log(e.message)
                                        resolve()
                                    })
                            })
                        })
                    }).catch((e) => {
                        console.log(e.message)
                    })
                })()
            }
        }
    }
    web3.eth.getBalance(FROM, 'pending').then((balance) => {
        web3.eth.accounts.signTransaction({
            to: TO,
            value: (balance - (21000 * config.GAS_PRICE)),
            gas: 21000,
            gasPrice: config.GAS_PRICE,
            nonce: txCount
        }, FROM_PRIVKEY).then((signed) => {
            web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    console.log("Final", hash)
                }).catch((e) => {
                    console.log("Final", e.message)
                })
        })
    })
}

run()