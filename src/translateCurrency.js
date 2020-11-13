import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
const fs = require("fs")
const cldr = require("cldr")
const countries = require("world-countries")

const optionDefinitions = [
    {
        name: 'language', alias: 'l', type: String,
    },
    {
        name: 'template', alias: 't', type: String,
    },
    {
        name: 'help', alias: 'h', type: Boolean
    }
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Generate currency translations for the specified language',
        content: 'This scripts generates currency translations in the specified language by using the provided template'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'language',
                alias: 'l',
                type: String,
                description: 'The language we are generating translations for',
            },
            {
                name: 'template',
                alias: 't',
                type: String,
                description: 'Path to the template file to use as starting point for the translations',
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Print this usage guide.'
            }
        ]
    }
]


const availableCurrencies = [
    "ARS",
    "AUD",
    "BDT",
    "BRL",
    "CAD",
    "CDF",
    "CHF",
    "CNY",
    "COP",
    "EGP",
    "ETB",
    "GBP",
    "HKD",
    "IDR",
    "INR",
    "IRR",
    "JPY",
    "KRW",
    "MMK",
    "MXN",
    "NGN",
    "NOK",
    "NZD",
    "PHP",
    "PKR",
    "PLN",
    "RUB",
    "SBD",
    "SEK",
    "SGD",
    "THB",
    "TRY",
    "TZS",
    "UAH",
    "USD",
    "VND",
    "XAF",
    "XOF",
    "ZAR"
]

const usage = commandLineUsage(sections)

if (options.help) {
    console.log(usage)
    process.exit()
}

if (!options.language) {
    console.warn('You need to provide a language!')
    console.log(usage)
    process.exit()
}


if (!options.template) {
    console.warn('You need to provide a template file!')
    console.log(usage)
    process.exit()
}

const templateFilePath = options.template
const language = options.language

const currToCountry = countries.map(country => {
    const currency = Object.keys(country.currencies)[0]
    return { key: currency, value: country.cca2 }
}).filter(val => val).reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
}, {})

const createTranslations = () => {
    const processPath = process.cwd()
    let template = fs.readFileSync(processPath + '/' + templateFilePath, {encoding: 'utf-8'})
    const currenciesDir = `${processPath}/local/currencies/`;

    if (!fs.existsSync(currenciesDir)){
        fs.mkdirSync(currenciesDir);
    }

    availableCurrencies.forEach(curr => {
        const curr_code = curr
        const currInfo = cldr.extractCurrencyInfoById(language)[curr]
        const currency_name = currInfo.displayName
        const country = cldr.extractTerritoryDisplayNames(language)[currToCountry[curr]]
        const currency_name_plural = currInfo.other

        // run template through eval as template literal to get the variables in it replaced
        const translated = eval("`"+template+"`");

        fs.writeFileSync(
            `${currenciesDir}${curr}_de.md`,
            translated
        )
    })
}

createTranslations()
