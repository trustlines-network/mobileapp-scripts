import admin from 'firebase-admin'
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

const optionDefinitions = [
    {
        name: 'token', alias: 't', type: String, defaultOption: true
    },
    {
        name: 'help', alias: 'h', type: Boolean
    }
]

const options = commandLineArgs(optionDefinitions)

const sections = [
    {
        header: 'Send a test notification to the specified token',
        content: 'This script sends a test notification to the specified firebase token'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'token',
                alias: 't',
                type: Number,
                description: 'The registration token to send the message to',
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Print this usage guide.'
            }
        ]
    }
]

const usage = commandLineUsage(sections)

if (options.help) {
    console.log(usage)
    process.exit()
}

if (!options.token) {
    console.warn('You need to provide a token')
    console.log(usage)
    process.exit()
}

const init = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });

    const registrationToken = options.token
    const message = {
        notification: {
            title: 'Test message title',
            body: 'Test message body'
        },
        token: registrationToken
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    return admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

}

init().then(() => {
    process.exit();
})
