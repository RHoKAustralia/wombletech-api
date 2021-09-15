Currently using AWS region ap-southeast-2
# pre-requisites (TODO)
- SAM CLI - https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
- AWS-VAULT CLI - https://github.com/99designs/aws-vault
- Docker - required for local testing of the api - https://hub.docker.com/search/?type=edition&offering=community
- Configure `~/.aws/config`

## AWS prep
Create one dynamodb tables (expect this to change)
1. wombletech_donations (donationId)

## security
None as yet - this is a todo

# Developer flow
## local testing (build and local testing)
1. `yarn build`
2. `aws-vault exec <profile> -- sam local start-api --env-vars env.json`

# debugging
1. `yarn build`
2. `aws-vault exec <profile> -- sam local start-api --env-vars env.json -d 5858`
3. Trigger lambda ie use something like postman if function handles web requests
4. In VSCode - use `Attach to SAM CLI` option (details in `launch.json`)

## instructions (deploy)
1. `aws-vault exec <profile> -- yarn deploy`

## clean up
1. `aws cloudformation delete-stack --stack-name <Stack-Name>`
2. non-Prod: remove the dynamodb tables

# Useful information from original SAM guidance
## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
WombletechRHoK$ sam logs -n HelloWorldFunction --stack-name WombletechRHoK --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `hello-world/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests.

```bash
WombletechRHoK$ cd hello-world
hello-world$ npm install
hello-world$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name WombletechRHoK
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
