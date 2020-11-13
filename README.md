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

### Firebase Admin
Some of the scripts use the firebase-admin sdk. For those scripts to work one needs a service account file
and the `GOOGLE_APPLICATION_CREDENTIALS` environment variable needs to point to this file.

**To set the environment variable** 

Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the file path of the JSON file that contains your service account key. This variable only applies to your current shell session, so if you open a new session, set the variable again.
```
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
```

## Available scripts
To see usage information call every script with the -h flag

 - **generateTestAccounts** - this script generates 2 test accounts, a trustline between them and payments between them.
 - **notifications** - sends a firebase cloud message to the specified device token.
 - **translateCurrency** - Generate currency translations from the provided template in the specified language. Use the translateCurrencyTemplate.dist as a starting point for the template file structure.

