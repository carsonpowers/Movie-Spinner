/**
 * AWS CDK Stack for Movie Wheel Application
 * Includes: ECS Fargate, CloudFront, S3, ECR, ALB, and observability
 */

import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager'
import { Construct } from 'constructs'

export class MovieWheelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ============================================
    // VPC Configuration
    // ============================================
    const vpc = new ec2.Vpc(this, 'MovieWheelVPC', {
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
    })

    // ============================================
    // ECR Repository
    // ============================================
    const ecrRepository = new ecr.Repository(this, 'MovieWheelECR', {
      repositoryName: 'movie-wheel',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
        },
      ],
    })

    // ============================================
    // S3 Bucket for Static Assets
    // ============================================
    const staticAssetsBucket = new s3.Bucket(this, 'MovieWheelStaticAssets', {
      bucketName: `movie-wheel-static-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
    })

    // ============================================
    // CloudFront Origin Access Identity
    // ============================================
    const oai = new cloudfront.OriginAccessIdentity(this, 'MovieWheelOAI', {
      comment: 'OAI for Movie Wheel static assets',
    })

    staticAssetsBucket.grantRead(oai)

    // ============================================
    // ECS Cluster
    // ============================================
    const cluster = new ecs.Cluster(this, 'MovieWheelCluster', {
      clusterName: 'movie-wheel-cluster',
      vpc,
      containerInsights: true,
    })

    // ============================================
    // Task Execution Role
    // ============================================
    const executionRole = new iam.Role(this, 'MovieWheelExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    })

    // ============================================
    // Task Role
    // ============================================
    const taskRole = new iam.Role(this, 'MovieWheelTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    // Grant X-Ray permissions
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess')
    )

    // ============================================
    // CloudWatch Log Group
    // ============================================
    const logGroup = new logs.LogGroup(this, 'MovieWheelLogGroup', {
      logGroupName: '/ecs/movie-wheel',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // ============================================
    // Task Definition
    // ============================================
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MovieWheelTaskDef', {
      family: 'movie-wheel-task',
      cpu: 512,
      memoryLimitMiB: 1024,
      executionRole,
      taskRole,
    })

    // Main application container
    const appContainer = taskDefinition.addContainer('MovieWheelApp', {
      containerName: 'movie-wheel-app',
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'movie-wheel',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      secrets: {
        // Add secrets from AWS Secrets Manager or SSM Parameter Store
        // FIREBASE_PRIVATE_KEY: ecs.Secret.fromSecretsManager(secret),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    })

    appContainer.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    })

    // X-Ray sidecar container
    const xrayContainer = taskDefinition.addContainer('XRayDaemon', {
      containerName: 'xray-daemon',
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/xray/aws-xray-daemon:latest'),
      cpu: 32,
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'xray',
        logGroup,
      }),
    })

    xrayContainer.addPortMappings({
      containerPort: 2000,
      protocol: ecs.Protocol.UDP,
    })

    // ============================================
    // Application Load Balancer
    // ============================================
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MovieWheelALB', {
      vpc,
      internetFacing: true,
      http2Enabled: true,
      deletionProtection: false,
    })

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'MovieWheelTargetGroup', {
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
    })

    const listener = alb.addListener('MovieWheelListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    })

    // ============================================
    // ECS Fargate Service
    // ============================================
    const service = new ecs.FargateService(this, 'MovieWheelService', {
      cluster,
      taskDefinition,
      serviceName: 'movie-wheel-service',
      desiredCount: 2,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      enableExecuteCommand: true,
      circuitBreaker: {
        rollback: true,
      },
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
    })

    service.attachToApplicationTargetGroup(targetGroup)

    // Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    })

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    })

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    })

    // ============================================
    // CloudFront Distribution
    // ============================================
    const cachePolicy = new cloudfront.CachePolicy(this, 'MovieWheelCachePolicy', {
      cachePolicyName: 'MovieWheelCachePolicy',
      comment: 'Cache policy for Movie Wheel with stale-while-revalidate',
      defaultTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(1),
      maxTtl: cdk.Duration.days(365),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('CloudFront-Is-Mobile-Viewer', 'CloudFront-Is-Desktop-Viewer'),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    })

    const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'MovieWheelOriginRequestPolicy', {
      originRequestPolicyName: 'MovieWheelOriginRequestPolicy',
      comment: 'Origin request policy for Movie Wheel',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
        'Accept',
        'Accept-Language',
        'CloudFront-Forwarded-Proto',
        'Host',
        'User-Agent'
      ),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
    })

    const distribution = new cloudfront.Distribution(this, 'MovieWheelDistribution', {
      comment: 'Movie Wheel CloudFront Distribution',
      defaultBehavior: {
        origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy,
        originRequestPolicy,
        compress: true,
      },
      additionalBehaviors: {
        '/static/*': {
          origin: new origins.S3Origin(staticAssetsBucket, {
            originAccessIdentity: oai,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
        '/_next/static/*': {
          origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
      },
      enableLogging: true,
      logBucket: new s3.Bucket(this, 'MovieWheelCFLogs', {
        bucketName: `movie-wheel-cf-logs-${this.account}`,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        lifecycleRules: [
          {
            expiration: cdk.Duration.days(90),
          },
        ],
      }),
      logFilePrefix: 'cloudfront/',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      enableIpv6: true,
    })

    // ============================================
    // CloudWatch Alarms
    // ============================================
    new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: service.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      alarmDescription: 'Alert when CPU utilization is above 80%',
      alarmName: 'MovieWheel-HighCPU',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      metric: service.metricMemoryUtilization(),
      threshold: 85,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      alarmDescription: 'Alert when memory utilization is above 85%',
      alarmName: 'MovieWheel-HighMemory',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    new cloudwatch.Alarm(this, 'UnhealthyTargetAlarm', {
      metric: targetGroup.metricUnhealthyHostCount(),
      threshold: 1,
      evaluationPeriods: 2,
      alarmDescription: 'Alert when there are unhealthy targets',
      alarmName: 'MovieWheel-UnhealthyTargets',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    new cloudwatch.Alarm(this, 'High5XXErrorsAlarm', {
      metric: alb.metricHttpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT),
      threshold: 10,
      evaluationPeriods: 1,
      alarmDescription: 'Alert when there are more than 10 5XX errors',
      alarmName: 'MovieWheel-High5XXErrors',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })

    // ============================================
    // CloudWatch Dashboard
    // ============================================
    const dashboard = new cloudwatch.Dashboard(this, 'MovieWheelDashboard', {
      dashboardName: 'MovieWheelMetrics',
    })

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'ECS Service CPU & Memory',
        left: [service.metricCpuUtilization()],
        right: [service.metricMemoryUtilization()],
      }),
      new cloudwatch.GraphWidget({
        title: 'ALB Request Count',
        left: [alb.metricRequestCount()],
      }),
      new cloudwatch.GraphWidget({
        title: 'ALB Target Response Time',
        left: [alb.metricTargetResponseTime()],
      }),
      new cloudwatch.GraphWidget({
        title: 'CloudFront Requests',
        left: [distribution.metricRequests()],
      })
    )

    // ============================================
    // Outputs
    // ============================================
    new cdk.CfnOutput(this, 'ECRRepositoryUri', {
      value: ecrRepository.repositoryUri,
      description: 'ECR Repository URI',
      exportName: 'MovieWheelECRUri',
    })

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
      exportName: 'MovieWheelCloudFrontURL',
    })

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'Application Load Balancer DNS',
      exportName: 'MovieWheelALBDNS',
    })

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: staticAssetsBucket.bucketName,
      description: 'S3 Static Assets Bucket Name',
      exportName: 'MovieWheelS3Bucket',
    })

    new cdk.CfnOutput(this, 'ECSClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
      exportName: 'MovieWheelClusterName',
    })

    new cdk.CfnOutput(this, 'ECSServiceName', {
      value: service.serviceName,
      description: 'ECS Service Name',
      exportName: 'MovieWheelServiceName',
    })
  }
}
