<div align="center">
  <h1 align="center">Papermark</h1>
  <h3>The open-source DocSend alternative.</h3>

<a target="_blank" href="https://www.producthunt.com/posts/papermark-3?utm_source=badge-top-post-badge&amp;utm_medium=badge&amp;utm_souce=badge-papermark"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=411605&amp;theme=light&amp;period=daily" alt="Papermark - The open-source DocSend alternative | Product Hunt" style="width:250px;height:40px"></a>

</div>

<div align="center">
  <a href="https://www.papermark.io">papermark.io</a>
</div>

<br/>

<div align="center">
  <a href="https://github.com/mfts/papermark/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/mfts/papermark"></a>
  <a href="https://twitter.com/papermarkio"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/papermarkio"></a>
  <a href="https://github.com/mfts/papermark/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-AGPLv3-purple"></a>
</div>

<br/>

Papermark is the open-source document-sharing alternative to DocSend, featuring built-in analytics and custom domains.

## Features

- **Shareable Links:** Share your documents securely by sending a custom link.
- **Custom Branding:** Add a custom domain and your own branding.
- **Analytics:** Gain insights through document tracking and soon page-by-page analytics.
- **Self-hosted, Open-source:** Host it yourself and customize it as needed.

## Demo

![Papermark Welcome GIF](.github/images/papermark-welcome.gif)

## Tech Stack

- [Next.js](https://nextjs.org/) – Framework
- [TypeScript](https://www.typescriptlang.org/) – Language
- [Tailwind](https://tailwindcss.com/) – CSS
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Prisma](https://prisma.io) - ORM [![Made with Prisma](https://made-with.prisma.io/dark.svg)](https://prisma.io)
- [PostgreSQL](https://www.postgresql.org/) - Database
- [NextAuth.js](https://next-auth.js.org/) – Authentication
- [Tinybird](https://tinybird.co) – Analytics
- [Resend](https://resend.com) – Email
- [Stripe](https://stripe.com) – Payments
- [Vercel](https://vercel.com/) – Hosting

## Getting Started

### Prerequisites

Here's what you need to run Papermark:

- Node.js (version >= 18.17.0)
- PostgreSQL Database
- Blob storage (currently [AWS S3](https://aws.amazon.com/s3/) or [Vercel Blob](https://vercel.com/storage/blob))
- [Resend](https://resend.com) (for sending emails)
- [Trigger](https://trigger.dev) account (for running the workers)
- [TinyBird](https://tinybird.co) account (for document analytics)
- [Upstash](upstash.com) account

### 1. Clone the repository

```shell
git clone https://github.com/vibinex/papermark.git
cd papermark
# Checkout remote branch
git fetch origin deploy
git checkout -b deploy origin/deploy
```

### 2. Install npm dependencies

```shell
npm install
```

### 3. Copy the environment variables to `.env` and change the values

```shell
cp .env.example .env
```
- Create a Supabase project and populate the database url in the POSTGRES_PRISMA_URL
- Create a blob on Vercel and enter the BLOB_READ_WRITE_TOKEN & NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST from it
- Add your API key from your Resend account in RESEND_API_KEY
- From your TinyBird project, add the TINYBIRD_BASEURL and TINYBIRD_TOKEN
- (optional) From your Upstash account, select the QStash option and populate the QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, & QSTASH_NEXT_SIGNING_KEY variables.
- From your Tigger.dev account, add the `dev` API key in the TRIGGER_SECRET_KEY variable
- Add a random string in the INTERNAL_API_KEY variable

### 4. Initialize the database

```shell
npm run dev:prisma
```

### 5. Run the Trigger dev server

Modify the `project` parameter in the `trigger.config.ts` file to match your project ID.

Then run:
```shell
npm run trigger:v3:dev
```

### 6. Run the dev server

```shell
npm run dev
```

### 7. Open the app in your browser

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Tinybird Instructions

To prepare the Tinybird database, follow these steps:

0. We use `pipenv` to manage our Python dependencies. If you don't have it installed, you can install it using the following command:
   ```sh
   pkgx pipenv
   ```
1. Download the Tinybird CLI from [here](https://www.tinybird.co/docs/cli.html) and install it on your system.
2. After authenticating with the Tinybird CLI, navigate to the `lib/tinybird` directory:
   ```sh
   cd lib/tinybird
   ```
3. Push the necessary data sources using the following command:
   ```sh
   tb push datasources/*
   tb push endpoints/get_*
   ```
4. Don't forget to set the `TINYBIRD_TOKEN` with the appropriate rights in your `.env` file.

#### Updating Tinybird

```sh
pipenv shell
## start: pkgx-specific
cd ..
cd papermark
## end: pkgx-specific
pipenv update tinybird-cli
```

## Deploying

### Deploying Papermark

The easiest way to deploy is using vercel. The whole deployment is completely free if you are expecting low volumes.

```shell
npm install -g vercel
vercel login
```

Complete the authentication using your browser.

```shell
vercel --prod
```
This will try to deploy, but the deployment will fail because of the absence of environment variables. You can copy the `.env` file with the following changes:

1. Change the NEXTAUTH_URL, NEXT_PUBLIC_BASE_URL & NEXT_PUBLIC_MARKETING_URL to the static prod URL in the vercel project
2. For the POSTGRES_PRISMA_URL, make sure that the url you have copied is from the "Prisma" option provided by Supabase.
3. Replace the TRIGGER_SECRET_KEY with the `prod` API key.

Now run the command again:
```shell
vercel --prod
```
This should successfully launch papermark - but it will not be fully functional unless you deploy your trigger.dev in production.

### Deploying trigger

First, you will need to copy the following environment variables from the vercel deployment to your trigger.dev project:

1. INTERNAL_API_KEY
2. NEXTAUTH_URL
3. NEXT_PUBLIC_BASE_URL
4. NEXT_PUBLIC_MARKETING_URL
5. POSTGRES_PRISMA_URL
6. POSTGRES_PRISMA_URL_NON_POOLING

```shell
npx trigger.dev@latest deploy
```

### Getting the paid features for free
You will get the full experience of Papermark, but to get the paid features, you will need to change some values in your Postgres database.

After you have created an account (signup with email - because we didn't set up Google OAuth env variables), go to your Supabase project and look for the following tables:

1. User
2. Team

In both these tables, change the 'plan' column value for your user and team from "free" to "business".

## Contributing

Papermark is an open-source project, and we welcome contributions from the community.

If you'd like to contribute, please fork the repository and make any changes you'd like. Pull requests are warmly welcome.

### Our Contributors ✨

<a href="https://github.com/mfts/papermark/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mfts/papermark" />
</a>
