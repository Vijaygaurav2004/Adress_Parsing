This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
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

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with [Radix UI](https://www.radix-ui.com/)
- **Development**: TypeScript, ESLint

## 📝 Usage

1. **Enter Location Details**:
   - Input latitude and longitude coordinates
   - Provide the complete address text

2. **Parse Address**:
   - Click "Parse Address" to process the input
   - System validates society name, block, and flat number
   - Checks if location is within serviceable range (5km)

3. **View Results**:
   - See parsed address components
   - Check serviceability status
   - View proximity notes
   - Review historical parsing records in the table

## 🏘️ Supported Societies

Currently supports the following residential societies:

- Prestige Fern Residency
  - Blocks: 1, 2
  - Flats: 101, 102, 201, 202

- Sobha Silicon Oasis
  - Blocks: Magnifica, Vivo
  - Flats: 101, 102, 103, 201, 202, 203

- Prestige Sunrise Park
  - Blocks: A, B
  - Flats: 101, 102, 201, 203

## 🔍 Address Format

For optimal results, use the following format:

```
Flat <Flat Number>, Block <Block Name>, <Society Name>, <Street Address>, <City> - <Postal Code>
```

