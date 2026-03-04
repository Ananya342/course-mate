# course-mate

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Email verification setup

Signup uses Gmail SMTP to send verification codes (free for low volume).

1. Copy `.env.example` to `.env.local` if you don’t have it yet.
2. Set `GMAIL_USER` to your Gmail address (e.g. `you@gmail.com`).
3. Set `GMAIL_APP_PASSWORD` to a [Gmail App Password](https://support.google.com/accounts/answer/185833):
   - Turn on 2-Step Verification for your Google account.
   - Go to Google Account → Security → 2-Step Verification → App passwords.
   - Create an app password for “Mail” and paste the 16-character value.
4. Restart the dev server after changing env vars.

If these env vars are missing, verification emails cannot be sent.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
