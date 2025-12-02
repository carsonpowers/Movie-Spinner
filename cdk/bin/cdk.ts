#!/usr/bin/env node
/**
 * AWS CDK App Entry Point
 */

import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MovieWheelStack } from '../lib/movie-wheel-stack'

const app = new cdk.App()

new MovieWheelStack(app, 'MovieWheelStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  description: 'Movie Wheel - ECS Fargate + CloudFront + S3 Stack',
  tags: {
    Project: 'MovieWheel',
    Environment: process.env.ENVIRONMENT || 'production',
    ManagedBy: 'CDK',
  },
})

app.synth()
