# Ethereum Account Migrator

Utility tool to migrate one account to another, this will transfer all known tokens and then final transfer
whole ethereum balance

## Getting Started

Make sure you have to raw private key for the account from which you want to migrate from
Example raw private key: `0x442a08ec0d7c4a5879cbb86cb2fba936b0ab1450949ec44780d949ab576285dc`
you also need the address where you want to migrate to
Example address: `0xdecaf9cd2367cdbb726e904cd6397edfcae6068d`

### Prerequisites
```
Fully synced ethereum node with rpc (You can use following for mainnet if you dont have one)
    https://api.myetherapi.com/eth
    https://mainnet.infura.io/mew
    https://mew.giveth.io
```

### Configuration

```
open config.js and set the values
```

### Running
```
npm install
npm start
```

## Authors

* **kvhnuke** - *Initial work* - [kvhnuke](https://github.com/kvhnuke)
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details