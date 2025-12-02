# AWS Deployment Guide for Movie Wheel

This guide provides step-by-step instructions for deploying the Movie Wheel application to AWS using the refactored architecture.

## Architecture Overview

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Container**: Docker
- **Compute**: AWS ECS Fargate
- **CDN**: AWS CloudFront
- **Storage**: AWS S3
- **Registry**: AWS ECR
- **Infrastructure**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth + NextAuth
- **Monitoring**: CloudWatch, X-Ray

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Bun** installed (v1.0+)
4. **Docker** installed
5. **GitHub** repository with secrets configured
6. **Firebase** project set up

## Step 1: Configure Environment Variables

### 1.1 Local Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all required values:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# NextAuth
AUTH_FIREBASE_PROJECT_ID=your-project-id
AUTH_FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
AUTH_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
AUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Movie API
OMDB_API_KEY=your-omdb-api-key

# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
```

### 1.2 GitHub Secrets

Configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# All Firebase and OAuth credentials from .env.local
FIREBASE_PRIVATE_KEY=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...
OMDB_API_KEY=...
```

## Step 2: Set Up AWS Infrastructure

### 2.1 Configure AWS CLI

```bash
aws configure
```

Enter your AWS credentials and default region.

### 2.2 Bootstrap CDK (First Time Only)

```bash
cd cdk
bun install
bun run cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace `ACCOUNT-ID` with your AWS account ID and `REGION` with your target region (e.g., `us-east-1`).

### 2.3 Deploy Infrastructure

```bash
# Synthesize CloudFormation template
bun run cdk synth

# Review changes
bun run cdk diff

# Deploy the stack
bun run cdk deploy
```

This will create:
- VPC with public and private subnets
- ECR repository for Docker images
- ECS Fargate cluster and service
- Application Load Balancer
- CloudFront distribution
- S3 buckets for static assets and logs
- IAM roles and policies
- CloudWatch log groups and alarms
- CloudWatch dashboard

### 2.4 Note the Outputs

After deployment, note the following outputs:
- `ECRRepositoryUri`: ECR repository URI
- `CloudFrontURL`: CloudFront distribution URL
- `LoadBalancerDNS`: ALB DNS name
- `S3BucketName`: S3 bucket name

## Step 3: Build and Push Docker Image

### 3.1 Authenticate with ECR

```bash
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### 3.2 Build Docker Image

```bash
# Build with Bun
docker build -t movie-wheel .

# Tag for ECR
docker tag movie-wheel:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/movie-wheel:latest
```

### 3.3 Push to ECR

```bash
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/movie-wheel:latest
```

### 3.4 Update ECS Service

```bash
aws ecs update-service \
  --cluster movie-wheel-cluster \
  --service movie-wheel-service \
  --force-new-deployment \
  --region $AWS_REGION
```

## Step 4: Configure Firebase

### 4.1 Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Enable Authentication (Google provider)
5. Set up security rules

### 4.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Movies collection
    match /movies/{movieId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // NextAuth collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4.3 Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posters/{userId}/{movieId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Step 5: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-cloudfront-url.cloudfront.net/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
4. Save Client ID and Client Secret

## Step 6: Set Up CI/CD with GitHub Actions

The GitHub Actions workflow is already configured in `.github/workflows/ci-cd.yml`.

### 6.1 Workflow Triggers

- **Push to `main`**: Full CI/CD pipeline with deployment
- **Push to `develop`**: Build and test only
- **Pull Requests**: Lint and test only

### 6.2 Workflow Steps

1. **Lint & Type Check**: Validates code quality
2. **Tests**: Runs test suite with Bun
3. **Build Docker Image**: Builds and pushes to ECR
4. **Deploy with CDK**: Updates infrastructure and deploys
5. **Lighthouse CI**: Runs performance tests
6. **Cache Invalidation**: Clears CloudFront cache

### 6.3 Manual Deployment

Trigger manually from GitHub Actions UI or:

```bash
gh workflow run ci-cd.yml
```

## Step 7: Configure Custom Domain (Optional)

### 7.1 Request SSL Certificate

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 7.2 Validate Certificate

Add the DNS validation records to your domain's DNS settings.

### 7.3 Update CloudFront Distribution

Modify `cdk/lib/movie-wheel-stack.ts` to add:

```typescript
const certificate = certificatemanager.Certificate.fromCertificateArn(
  this,
  'Certificate',
  'arn:aws:acm:us-east-1:ACCOUNT-ID:certificate/CERTIFICATE-ID'
)

const distribution = new cloudfront.Distribution(this, 'MovieWheelDistribution', {
  certificate,
  domainNames: ['yourdomain.com', 'www.yourdomain.com'],
  // ... rest of config
})
```

Redeploy:

```bash
cd cdk
bun run cdk deploy
```

### 7.4 Update DNS Records

Add CNAME record pointing to CloudFront distribution domain.

## Step 8: Monitoring and Observability

### 8.1 CloudWatch Dashboard

Access the dashboard:
```bash
aws cloudwatch get-dashboard \
  --dashboard-name MovieWheelMetrics \
  --region $AWS_REGION
```

Or view in AWS Console: CloudWatch > Dashboards > MovieWheelMetrics

### 8.2 CloudWatch Logs

View application logs:
```bash
aws logs tail /ecs/movie-wheel --follow --region $AWS_REGION
```

### 8.3 X-Ray Traces

Access X-Ray console to view distributed traces and service maps.

### 8.4 CloudWatch Alarms

Configured alarms:
- High CPU (>80%)
- High Memory (>85%)
- Unhealthy targets
- High 5XX errors

Configure SNS topic for notifications:
```bash
aws sns create-topic --name movie-wheel-alerts --region $AWS_REGION
aws sns subscribe --topic-arn TOPIC-ARN --protocol email --notification-endpoint your@email.com
```

## Step 9: Performance Optimization

### 9.1 CloudFront Cache Optimization

Cache is already configured with:
- `stale-while-revalidate` headers
- Brotli and Gzip compression
- HTTP/2 and HTTP/3
- Optimal cache policies

### 9.2 Image Optimization

Images are automatically optimized using Next.js Image component and Sharp.

### 9.3 Bundle Analysis

Run bundle analyzer:
```bash
bun run build
# Open .next/analyze/client.html
```

## Step 10: Scaling and Cost Optimization

### 10.1 Auto Scaling

ECS service is configured with auto-scaling based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- Min tasks: 1
- Max tasks: 10

### 10.2 Cost Monitoring

Set up AWS Cost Explorer and budgets:
```bash
aws budgets create-budget \
  --account-id $AWS_ACCOUNT_ID \
  --budget file://budget.json
```

## Troubleshooting

### Build Fails

1. Check Bun version: `bun --version`
2. Clear cache: `rm -rf .next node_modules && bun install`
3. Check TypeScript errors: `bun run type-check`

### Deployment Fails

1. Check CloudFormation events in AWS Console
2. Verify IAM permissions
3. Check CDK diff: `bun run cdk diff`

### Application Not Accessible

1. Check ECS task health: `aws ecs describe-services --cluster movie-wheel-cluster --services movie-wheel-service`
2. Check ALB target health in AWS Console
3. Verify security groups allow traffic

### High Latency

1. Check CloudWatch metrics
2. Review X-Ray traces
3. Verify CloudFront cache hit rate
4. Check database query performance

## Rollback Procedure

### Rollback ECS Deployment

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix movie-wheel-task

# Update to previous version
aws ecs update-service \
  --cluster movie-wheel-cluster \
  --service movie-wheel-service \
  --task-definition movie-wheel-task:PREVIOUS_VERSION
```

### Rollback Infrastructure

```bash
cd cdk
git checkout PREVIOUS_COMMIT
bun run cdk deploy
```

## Maintenance

### Update Dependencies

```bash
bun update
bun run type-check
bun run test
```

### Rotate Secrets

```bash
# Generate new NextAuth secret
openssl rand -base64 32

# Update in GitHub Secrets and redeploy
```

### Clean Up Old Resources

```bash
# Clean up old ECR images
aws ecr list-images --repository-name movie-wheel --query 'imageIds[?type(`imageTag`)!=`null`].[imageTag]' --output text | tail -n +11 | xargs -I {} aws ecr batch-delete-image --repository-name movie-wheel --image-ids imageTag={}

# Clean up old CloudWatch logs
aws logs delete-log-group --log-group-name /ecs/movie-wheel-old
```

## Security Checklist

- [ ] All secrets stored in AWS Secrets Manager or GitHub Secrets
- [ ] Firebase security rules configured
- [ ] HTTPS enforced via CloudFront
- [ ] Security headers configured in Next.js
- [ ] IAM roles follow least privilege principle
- [ ] VPC configured with private subnets
- [ ] CloudWatch logging enabled
- [ ] WAF configured (optional but recommended)
- [ ] Regular security updates via Dependabot

## Support and Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Bun Documentation](https://bun.sh/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)

## License

This deployment guide is part of the Movie Wheel project.
