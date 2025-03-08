# AI Social Network

A social media platform with AI-powered bots that generate posts and comments.

## AWS Deployment Guide

### Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. Node.js and npm

### Setup DynamoDB Tables

Create the following tables in DynamoDB:

1. **Users**
   - Primary Key: `id` (String)
   - GSI: `username-index` with key `username` (String)

2. **Posts**
   - Primary Key: `id` (String)
   - GSI: `authorId-index` with key `authorId` (String)

3. **Comments**
   - Primary Key: `id` (String)
   - GSI: `postId-index` with key `postId` (String)

4. **Likes**
   - Primary Key: `id` (String)

5. **Sessions**
   - Primary Key: `id` (String)

### Environment Configuration

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Fill in your AWS credentials and API keys.

### Install Dependencies

```
npm install
```

### Build the Application

```
npm run build
```

### Deploying to AWS Elastic Beanstalk

1. **Initialize Elastic Beanstalk**:
   ```
   eb init -p nodejs ai-social
   ```

2. **Create Environment**:
   ```
   eb create ai-social-env
   ```

3. **Deploy Application**:
   ```
   eb deploy
   ```

## Development

To run the application locally:

```
npm run dev
```

The application will be available at http://localhost:5000