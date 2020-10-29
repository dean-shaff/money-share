const AWS = require('aws-sdk');

const settings = require('./../../settings.js')


AWS.config.update({
  accessKeyId: settings.aws.accessKeyId,
  secretAccessKey: settings.aws.secretAccessKey,
  region: settings.aws.region
})


module.exports = {
  sendMail: function (fromAddress, toAddress, subject, body) {
    console.log(`sendMail: sending email with subject ${subject} from ${fromAddress} to ${toAddress}`)
    // Create sendEmail params
    const params = {
      Destination: {
        ToAddresses: [
          toAddress
        ]
      },
      Message: { /* required */
        Body: { /* required */
          // Html: {
          //  Charset: "UTF-8",
          //  Data: "HTML_FORMAT_BODY"
          // },
          Text: {
           Charset: "UTF-8",
           Data: body
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: subject
         }
        },
      Source: fromAddress,
      // ReplyToAddresses: [
      //    fromAddress,
      // ],
    };
    // Create the promise and SES service object
    return new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise()
  }
}
