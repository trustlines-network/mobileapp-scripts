# Mobileapp-scripts
This repo contains scripts that help us with the development of the trustlines mobile app

## Structure
The scripts are located in the `src` directory and need to be executed through node with esm

```
node -r esm SCRIPT_NAME
```

Although node 13 is able to run esm scripts, it fails when we mix esm and cjm scripts. That's why
we need to run them through the esm loader.

## Config
Rename the `config.dist.js` file into `config.js` and specify the correct parameters to connect to your relay server

## Available scripts
To see usage information call every script with the -h flag

 - *generateTestAccoounts* - this script generates 2 test accounts, a trustline between them and payments between them.
