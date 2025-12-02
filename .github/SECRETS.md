# GitHub Repository Secrets Setup Guide

This document lists all required secrets for GitHub Actions CI/CD pipeline.

## Required Secrets

Navigate to: `Repository Settings > Secrets and variables > Actions > New repository secret`

### AWS Credentials

```
Name: AWS_ACCESS_KEY_ID
Value: Your AWS access key ID

Name: AWS_SECRET_ACCESS_KEY
Value: Your AWS secret access key

Name: AWS_ACCOUNT_ID
Value: Your 12-digit AWS account ID

Name: AWS_REGION
Value: us-east-1 (or your preferred region)
```

### Firebase Configuration

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: Your Firebase API key

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: your-project.firebaseapp.com

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: your-project-id

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: your-project.appspot.com

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: Your messaging sender ID

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: Your app ID

Name: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: Your measurement ID
```

### Firebase Admin (Server-side)

```
Name: FIREBASE_PROJECT_ID
Value: your-project-id

Name: FIREBASE_CLIENT_EMAIL
Value: service-account@project.iam.gserviceaccount.com

Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
(Include the full private key with \n characters)

Name: AUTH_FIREBASE_PROJECT_ID
Value: Same as FIREBASE_PROJECT_ID

Name: AUTH_FIREBASE_CLIENT_EMAIL
Value: Same as FIREBASE_CLIENT_EMAIL

Name: AUTH_FIREBASE_PRIVATE_KEY
Value: Same as FIREBASE_PRIVATE_KEY
```

### NextAuth

```
Name: AUTH_SECRET
Value: Generate with: openssl rand -base64 32
```

### Google OAuth

```
Name: GOOGLE_CLIENT_ID
Value: your-client-id.apps.googleusercontent.com

Name: GOOGLE_CLIENT_SECRET
Value: Your Google OAuth client secret
```

### Movie API

```
Name: OMDB_API_KEY
Value: Your OMDB API key (or other movie API key)
```

### Optional: Lighthouse CI

```
Name: LHCI_GITHUB_APP_TOKEN
Value: Your Lighthouse CI GitHub App token (optional)
```

### Optional: Codecov

```
Name: CODECOV_TOKEN
Value: Your Codecov token for coverage reports (optional)
```

## Environment Variables (Repository Variables)

Navigate to: `Repository Settings > Secrets and variables > Actions > Variables`

```
Name: ENVIRONMENT
Value: production

Name: ECR_REPOSITORY
Value: movie-wheel

Name: ECS_CLUSTER
Value: movie-wheel-cluster

Name: ECS_SERVICE
Value: movie-wheel-service
```

## Verification

After adding all secrets, you can verify by:

1. Going to `.github/workflows/ci-cd.yml`
2. Checking that all `${{ secrets.SECRET_NAME }}` references exist
3. Running the workflow manually to test

## Security Notes

- Never commit secrets to the repository
- Rotate secrets regularly
- Use least-privilege IAM policies
- Enable GitHub secret scanning
- Use environment protection rules for production
