#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MovieSpinnerStack } from '../lib/movie-spinner-stack';

const app = new cdk.App();

new MovieSpinnerStack(app, 'MovieSpinnerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Movie Spinner - Dockerized Next.js application with ECS Fargate',
});

app.synth();
