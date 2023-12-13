// const awsServerlessExpress = require('aws-serverless-express');
// const app = require('./app');
const {BedrockRuntimeClient, InvokeModelCommand} = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({
    serviceId: 'bedrock',
    region: 'us-east-1',
});

/**
 * @type {import('http').Server}
 */
// const server = awsServerlessExpress.createServer(app);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    console.log(`prompt: ${event.body}`)
    const result = await bedrock.send(
        new InvokeModelCommand({
            modelId: 'anthropic.claude-v2',
            contentType: 'application/json',
            accept: '*/*',
            body: JSON.stringify({
                prompt: event.body,
                max_tokens_to_sample: 2000,
                temperature: 1,
                top_k: 250,
                top_p: 0.5,
                stop_sequences: [],
                anthropic_version: 'bedrock-2023-05-31'
            })
        })
    )
    const res = JSON.parse(new TextDecoder().decode(result.body))
    console.log(res.completion);
  return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*"
      },
      body: res.completion
    };
    // return awsServerlessExpress.proxy(server, result, context, 'PROMISE').promise;
};
