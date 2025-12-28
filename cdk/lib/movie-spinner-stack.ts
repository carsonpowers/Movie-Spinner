import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class MovieSpinnerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    const vpc = new ec2.Vpc(this, 'MovieSpinnerVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Create Secrets Manager secret for environment variables
    const appSecret = new secretsmanager.Secret(this, 'MovieSpinnerSecret', {
      secretName: 'movie-spinner/env',
      description: 'Environment variables for Movie Spinner application',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          // App Configuration
          NEXT_PUBLIC_APP_URL: 'https://your-domain.com',
          
          // Firebase Client Configuration (Public)
          NEXT_PUBLIC_FIREBASE_API_KEY: 'your-firebase-api-key',
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com',
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'your-project-id',
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'your-bucket.firebasestorage.app',
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id',
          NEXT_PUBLIC_FIREBASE_APP_ID: 'your-app-id',
          NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'your-measurement-id',
          
          // Firebase Admin Configuration (Server-side only)
          FIREBASE_PROJECT_ID: 'your-project-id',
          FIREBASE_CLIENT_EMAIL: 'your-service-account@project.iam.gserviceaccount.com',
          FIREBASE_PRIVATE_KEY: 'your-private-key-here',
          FIREBASE_STORAGE_BUCKET: 'your-bucket.firebasestorage.app',
          
          // Google OAuth
          AUTH_GOOGLE_ID: 'your-google-client-id',
          AUTH_GOOGLE_SECRET: 'your-google-client-secret',
          
          // NextAuth Configuration
          AUTH_SECRET: 'generate-a-secret-key',
          AUTH_FIREBASE_PROJECT_ID: 'your-project-id',
          AUTH_FIREBASE_CLIENT_EMAIL: 'your-service-account@project.iam.gserviceaccount.com',
          AUTH_FIREBASE_PRIVATE_KEY: 'your-private-key-here',
          
          // OMDB API Key
          OMDB_API_KEY: 'your-omdb-api-key',
          
          // Environment
          NODE_ENV: 'production',
        }),
        generateStringKey: 'dummy', // Required but unused since we're providing the full template
      },
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'MovieSpinnerCluster', {
      vpc,
      clusterName: 'movie-spinner-cluster',
    });

    // Create CloudWatch log group
    const logGroup = new logs.LogGroup(this, 'MovieSpinnerLogGroup', {
      logGroupName: '/ecs/movie-spinner',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MovieSpinnerTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Grant the task role permission to read the secret
    appSecret.grantRead(taskDefinition.taskRole);

    // Add container to task definition
    const container = taskDefinition.addContainer('MovieSpinnerContainer', {
      image: ecs.ContainerImage.fromAsset('..', {
        file: 'Dockerfile',
        buildArgs: {
          NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
          NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
          NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
        },
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'movie-spinner',
        logGroup,
      }),
      secrets: {
        // All environment variables come from Secrets Manager
        NEXT_PUBLIC_APP_URL: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_APP_URL'),
        AUTH_URL: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_URL'),
        NEXT_PUBLIC_FIREBASE_API_KEY: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_API_KEY'),
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        NEXT_PUBLIC_FIREBASE_APP_ID: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_APP_ID'),
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ecs.Secret.fromSecretsManager(appSecret, 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
        FIREBASE_PROJECT_ID: ecs.Secret.fromSecretsManager(appSecret, 'FIREBASE_PROJECT_ID'),
        FIREBASE_CLIENT_EMAIL: ecs.Secret.fromSecretsManager(appSecret, 'FIREBASE_CLIENT_EMAIL'),
        FIREBASE_PRIVATE_KEY: ecs.Secret.fromSecretsManager(appSecret, 'FIREBASE_PRIVATE_KEY'),
        FIREBASE_STORAGE_BUCKET: ecs.Secret.fromSecretsManager(appSecret, 'FIREBASE_STORAGE_BUCKET'),
        AUTH_GOOGLE_ID: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_GOOGLE_ID'),
        AUTH_GOOGLE_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_GOOGLE_SECRET'),
        AUTH_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_SECRET'),
        AUTH_FIREBASE_PROJECT_ID: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_FIREBASE_PROJECT_ID'),
        AUTH_FIREBASE_CLIENT_EMAIL: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_FIREBASE_CLIENT_EMAIL'),
        AUTH_FIREBASE_PRIVATE_KEY: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_FIREBASE_PRIVATE_KEY'),
        OMDB_API_KEY: ecs.Secret.fromSecretsManager(appSecret, 'OMDB_API_KEY'),
        NODE_ENV: ecs.Secret.fromSecretsManager(appSecret, 'NODE_ENV'),
        AUTH_TRUST_HOST: ecs.Secret.fromSecretsManager(appSecret, 'AUTH_TRUST_HOST'),
      },
    });

    // Expose port 3000 (Next.js default)
    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Create Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MovieSpinnerALB', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'movie-spinner-alb',
    });

    // Create Fargate Service
    const service = new ecs.FargateService(this, 'MovieSpinnerService', {
      cluster,
      taskDefinition,
      serviceName: 'movie-spinner-service',
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Create target group and listener
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'MovieSpinnerTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // Add service to target group
    service.attachToApplicationTargetGroup(targetGroup);

    // Add HTTP listener
    const listener = alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    // Output the load balancer URL
    new cdk.CfnOutput(this, 'LoadBalancerUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'URL of the load balancer',
      exportName: 'MovieSpinnerUrl',
    });

    // Output the secret ARN
    new cdk.CfnOutput(this, 'SecretArn', {
      value: appSecret.secretArn,
      description: 'ARN of the Secrets Manager secret',
      exportName: 'MovieSpinnerSecretArn',
    });

    // Output instructions
    new cdk.CfnOutput(this, 'UpdateSecretsCommand', {
      value: `aws secretsmanager update-secret --secret-id ${appSecret.secretName} --secret-string file://secrets.json`,
      description: 'Command to update secrets from a JSON file',
    });
  }
}
