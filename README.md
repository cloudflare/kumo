# Kumo

Kumo is Cloudflare's component library for building modern web applications. It gives you a set of ready-to-use components that work well together and handle the details you'd otherwise have to build yourself.

## What you get

The library includes buttons, inputs, dialogs, menus, and other common interface elements. Each component handles keyboard navigation, focus management, and ARIA attributes. This means you can build accessible applications without thinking through every detail.

Kumo is built on Base UI. Meaning we get a lot of primitives and niceties for free.

## Getting started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Your application runs at `http://localhost:5173`.

## Building and deploying

Create a production build:

```bash
npm run build
```

Deploy to production:

```bash
npm run deploy
```

Deploy a preview version:

```bash
npx wrangler versions upload
```

After you verify the preview works, promote it to production:

```bash
npx wrangler versions deploy
```

## Accessibility

The components follow WAI-ARIA guidelines and work with keyboard navigation. They manage focus automatically and include the right ARIA attributes. You still need to style focus states and check color contrast, but the structural work is done.

## Styling

The library uses Tailwind CSS. You can use a different CSS framework if you prefer.
