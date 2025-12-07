# Movie Spinner CDK Infrastructure

This directory contains the AWS CDK infrastructure code for deploying the Movie Spinner application to AWS using Docker containers.

## Architecture

The infrastructure creates:

- **VPC**: A Virtual Private Cloud with public and private subnets across 2 availability zones
- **ECS Fargate**: Serverless container service running the Movie Spinner Docker container
- **Application Load Balancer**: Distributes traffic to the ECS service
- **AWS Secrets Manager**: Securely stores all environment variables
- **CloudWatch Logs**: Collects application logs

## Prerequisites

1. **AWS CLI**: Installed and configured with appropriate credentials
   ```bash
   aws configure
   ```

2. **AWS CDK**: Install globally
   ```bash
   npm install -g aws-cdk
   ```

3. **Node.js**: Version 18 or higher

4. **Docker**: Required for building the container image

## Initial Setup

1. **Bootstrap CDK** (first time only for your AWS account/region):
   ```bash
   cd cdk
   cdk bootstrap
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Configuration

### Setting Up Secrets

After the first deployment, you need to update the AWS Secrets Manager secret with your actual environment variables:

1. Create a `secrets.json` file with your environment variables:
   ```json
   {
     "NEXT_PUBLIC_APP_URL": "https://your-domain.com",
     "NEXT_PUBLIC_FIREBASE_API_KEY": "your-firebase-api-key",
     "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
     "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id",
     "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "your-bucket.firebasestorage.app",
     "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "your-sender-id",
     "NEXT_PUBLIC_FIREBASE_APP_ID": "your-app-id",
     "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID": "your-measurement-id",
     "FIREBASE_PROJECT_ID": "your-project-id",
     "FIREBASE_CLIENT_EMAIL": "your-service-account@project.iam.gserviceaccount.com",
     "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
     "FIREBASE_STORAGE_BUCKET": "your-bucket.firebasestorage.app",
     "AUTH_GOOGLE_ID": "your-google-client-id",
     "AUTH_GOOGLE_SECRET": "your-google-client-secret",
     "AUTH_SECRET": "generate-a-secret-key",
     "AUTH_FIREBASE_PROJECT_ID": "your-project-id",
     "AUTH_FIREBASE_CLIENT_EMAIL": "your-service-account@project.iam.gserviceaccount.com",
     "AUTH_FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
     "OMDB_API_KEY": "your-omdb-api-key",
     "NODE_ENV": "production"
   }
   ```

2. Update the secret in AWS:
   ```bash
   aws secretsmanager update-secret \
     --secret-id movie-spinner/env \
     --secret-string file://secrets.json
   ```

3. **Important**: Delete the `secrets.json` file after uploading to prevent credential exposure
   ```bash
   rm secrets.json
   ```

## Deployment

### Deploy the Stack

```bash
cd cdk
npm run deploy
```

This will:
1. Build the Docker image from the root directory
2. Push it to Amazon ECR
3. Create all infrastructure resources
4. Deploy the ECS service

### View Outputs

After deployment, CDK will output:
- **LoadBalancerUrl**: The URL where your application is accessible
- **SecretArn**: The ARN of the Secrets Manager secret
- **UpdateSecretsCommand**: Command to update secrets

## Useful Commands

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch for changes and compile
- `npm run cdk synth`: Emit the synthesized CloudFormation template
- `npm run cdk diff`: Compare deployed stack with current state
- `npm run deploy`: Deploy this stack to your default AWS account/region
- `npm run destroy`: Destroy the stack (clean up all resources)

## Monitoring

### View Logs

```bash
aws logs tail /ecs/movie-spinner --follow
```

### View Service Status

```bash
aws ecs describe-services \
  --cluster movie-spinner-cluster \
  --services movie-spinner-service
```

## Updating the Application

1. Make changes to your application code
2. Run `npm run deploy` from the `cdk` directory
3. CDK will build a new Docker image and update the ECS service

## Cost Optimization

The current configuration uses:
- **ECS Fargate**: 0.25 vCPU, 512 MB memory (minimal tier)
- **NAT Gateway**: Single NAT gateway for cost efficiency
- **Application Load Balancer**: Standard ALB pricing

To reduce costs further:
- Consider using EC2 instances instead of Fargate for long-running workloads
- Remove the NAT Gateway if you don't need private subnet internet access
- Use CloudFront in front of ALB for better caching and reduced ALB costs

## Troubleshooting

### Container Not Starting

Check the CloudWatch logs:
```bash
aws logs tail /ecs/movie-spinner --follow
```

### Health Check Failing

The health check endpoint is `/api/health`. Ensure this endpoint exists in your Next.js application and returns a 200 status code.

### Secret Access Issues

Verify the ECS task role has permission to access the secret:
```bash
aws secretsmanager get-secret-value --secret-id movie-spinner/env
```

## Security Considerations

1. **Secrets**: All sensitive environment variables are stored in AWS Secrets Manager
2. **VPC**: Application runs in private subnets with no direct internet access
3. **IAM**: Minimal permissions are granted to the ECS task role
4. **HTTPS**: For production, add an SSL certificate and configure HTTPS on the ALB

## Adding HTTPS (Recommended for Production)

1. Request a certificate in AWS Certificate Manager
2. Add to the stack:
   ```typescript
   const certificate = acm.Certificate.fromCertificateArn(
     this,
     'Certificate',
     'arn:aws:acm:region:account:certificate/xxx'
   );
   
   alb.addListener('HttpsListener', {
     port: 443,
     certificates: [certificate],
     defaultTargetGroups: [targetGroup],
   });
   ```

## Cleanup

To delete all resources:

```bash
cd cdk
npm run destroy
```

**Warning**: This will delete all resources including the Secrets Manager secret. Make sure to back up any important data first.
