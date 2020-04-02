---
title: Deploy Gatsby on AWS CloudFront and Lambda@Edge
description: 
---

### 1. Gatsby

1. QuickStart

```bash
gatsby new safecornerscoffee.com https://github.com/gatsbyjs/gatsby-starter-blog
```

2. Recommended Plugins
   - gatsby-plugin-s3
   - gatsby-plugin-canonical-urls



### 2. Github

```
git init
git add *
git commit -m "ititial commit"
git remote add origin git@github.com:alifeunfolds/safecornerscoffee.com.git
git push origin master
```



### 3. TravisCI

1. Activate Github Repository

2. Add .travis.yml

   ```yaml
   language: node_js
   node_js:
     - 13
   
   branches:
     only:
       - master
   
   cache: npm
   
   before_script:
     - "npm run-script clean"
   script:
     - "npm run-script build"
   
   notifications:
     email:
       recipients:
         - safecorners.mobile@gmail.com
   ```

3. Intergration Test

   ```
   git add .travis.yml
   git commit -m "test travisCI Intergration"
   git push origin master
   ```

   

4. AWS Access Key

   1. Naviigate IAM > User

   2. Add User

   3. *Programmatic access*

   4. Attach existing policies directly **AmazonS3FullAccess**

      ```
      User name
      travis-s3-safecornerscoffee
      AWS access type
      Programmatic access - with an access key
      
      Permissions summary
      Type			Name 
      Managed policy  AmazonS3FullAccess 
      ```

   5. Download .csv

      ```
      User				travis-s3-safecornerscoffee
      Access key ID		AKIAYFDDMRKCEIE5QVUH
      Secret access key 	*********
      ```

5. Register Access Key on Travis CI

   1. TravisCI > Dashboard > Repository > Settings

   2. Add Environment Variables

      ```
      AWS_ACCESS_KEY: AKIAYFDDMRKCEIE5QVUH
      AWS_SECRET_KEY: *********
      ```

6. Update *.travis.yml*:

   ```yaml
   language: node_js
   node_js:
     - 13
   
   branches:
     only:
       - master
   
   cache: npm
   
   before_script:
     - "npm run-script clean"
   script:
     - "npm run-script build"
   
   deploy:
     provider: s3
     access_key_id: $AWS_ACCESS_KEY
     secret_access_key: $AWS_SECRET_KEY
     bucket: safecornerscoffee-blog
     region: ap-northeast-2
     skip_cleanup: true
     acl: private
     local_dir: public
     wait-until-deployed: true
   
   notifications:
     email:
       recipients:
         - safecorners.mobile@gmail.com
   ```

   

7. Test Deploying on S3 Bucket

   ```
   git add .travis.yml
   git commit -m "test deploying on s3"
   ```

   

### 4. S3

1. **Blog Bucket** 
2. **Access Log Bucket**
3. Athena
4. CloudFront OAI Bucket Policy



### 5. CloudFront

##### 1. HTTPS Certifcation

1. AWS Certificate Manager (N.Virginia)

2. Request a certificate 

   1. Add domain names:

      ```
      safecornerscoffee.com
      *.safecornerscoffee.com
      ```

   2. Select DNS validation method 

   3.  Add CNAME record to the DNS configuration:

      ```
      safecornerscoffee.com,_3cddf79d45afe98ef8da2d4b9edea4a9.safecornerscoffee.com.,CNAME,_52e91daabbca1f5686e5843e40287b05.nhqijqilxf.acm-validations.aws.
      ```

      if you have a domain in AWS Registra, This process autometically proceed. AWESOME!!

      

##### 2. Create a Distribution

 	1.  Origin Domain Name must be S3 Bucket ARN, not WEB Endpoint.
 	2.  Set Origin Access Identity
 	3.  Cache TTL, there's three visible options to set caching strategy :
      - Inside here.
      - Lambda@Edge
      - StaticSite Generator (Gatsby)
 	4.  CNames (apex, canonical domain)
 	5.  Logging (Optional)



### 6. Lambda@Edge

1. Create Lambda Function at N.Virginia

```js
exports.handler = async (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;
    if(uri === `/index.html`) {
        callback(null, request);
    } else if (uri.endsWith(`/`)) {
        request.uri += `index.html`;
        callback(null, request);
    } else if(!uri.includes(`.`)) {
        request.uri += `/index.html`;
        callback(null, request);
    } else if (uri.endsWith(`/index.html`)) {
        const response = {
            status: `301`,
            headers: {
                location: [{
                    key: `Location`,
                    value: uri.slice(0, -10),
                }],
            }
        }
        callback(null, response);
    }
    
    callback(null, request);
};

```



2. Trust relationship configuration:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "edgelambda.amazonaws.com",
          "lambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```



3. Add CloudFront Trigger
   - Deploy to Lambda@Edge
   - Select Target Distribution
   - Origin Request Event



### 7. Route53

Updating Record Set Point to CloudFront ARN.







##### Google Analytics

1. https://analytics.google.com/
2. Settings > Tracking Information > Tracking ID



Todo List:

- [ ] 403, 404 Error Response Handling

- [ ] Gatsby Theme
- [ ] Add Tag, Author Fields



#### References

- [Cloudfront serve static website](https://aws.amazon.com/ko/premiumsupport/knowledge-center/cloudfront-serve-static-website/)
- [Website EndPoint](https://github.com/awsdocs/amazon-s3-developer-guide/blob/master/doc_source/WebsiteEndpoints.md)

- [Key Differences Between a Website Endpoint and a REST API Endpoint](https://github.com/awsdocs/amazon-s3-developer-guide/blob/master/doc_source/WebsiteEndpoints.md#WebsiteRestEndpointDiff)
- [Static website over https with S3, CloudFront, Gatsby — continuously delivered](https://itnext.io/static-website-over-https-with-s3-cloudfront-gatsby-continuously-delivered-b2b33bb7fa29)
- [Deploy a static web application on AWS, the right way](https://medium.com/faktiva/deploy-a-static-website-on-aws-the-right-way-e83f47d60fdc)
- [Building a static serverless website using S3 and CloudFront](https://sanderknape.com/2020/02/building-a-static-serverless-website-using-s3-cloudfront/)
- [Lambda@Edge Using an Origin-Response Trigger to Update the Error Status Code to 200-OK](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html#lambda-examples-custom-error-static-body)
- [Lambda@Edge Updating HTTP Responses in Origin-Response Triggers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-updating-http-responses.html)
- [Hosting S3 Static Website using CloudFront with OAI](https://code.eidorian.com/aws/2020/02/08/cloudfront-s3-static-website-with-oai.html)
- [Hosting a Gatsby site on S3 and CloudFront](https://www.ximedes.com/2018-04-23/deploying-gatsby-on-s3-and-cloudfront/)
- [Setup HTTP Security headers in a S3 hosted website](https://johnlouros.com/blog/setup-security-headers-s3-host-website)
- [AWS Lambda 개발자 가이드](https://docs.aws.amazon.com/ko_kr/lambda/index.html)
- [CloudFront Lambda@Edge와 함께 AWS Lambda](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/lambda-edge.html)
- [CloudFront Lambda@Edge 이벤트 구조](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response)
- [Lambda@Edge에 대한 IAM 권한 및 역할 설정](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html)
- [자습서: 간단한 Lambda@Edge 함수 생성](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html)
- [cloudfront-s3-origin-website-redirects](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:646719517841:applications~cloudfront-s3-origin-website-redirects)
- [TravisCI S3 Deployment](https://docs.travis-ci.com/user/deployment/s3/)

- [Gatsby Adding a Path Prefix](https://www.gatsbyjs.org/docs/path-prefix/)

