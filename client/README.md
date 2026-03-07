This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup Instructions

Follow these steps to run the TrustChain application with a local database:

### 1. Install Dependencies
Ensure you have Node.js (v18+) installed, then install project dependencies:
```bash
npm install
```

### 2. Setup Local MongoDB Database
You need a running MongoDB database for the application to work.

**If you installed MongoDB as a Windows Service (Recommended):**
It should already be running. If not, start it manually using this command in PowerShell (Run as Administrator):
```powershell
Start-Service MongoDB
```

**If you did not install it as a service:**
You can run the executable directly using this command in PowerShell:
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db"
```
*(Make sure the `C:\data\db` folder exists, or create it first).*

### 3. Configure Environment Variables
Create a `.env.local` file in the root of the `client` directory to connect the frontend to the database:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/trustchain
```

### 4. Run the Application
Finally, start the Next.js development server:

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

npx hardhat run scripts/deploy.js --network localhost