
# StaySafe Berkeley - Campus Safety Alerts

## Project info

**URL**: https://staysafeberkeley.org

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2d3b3eee-540b-45c0-af92-188ab44e0d6a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Google Maps API
- UC Berkeley safety data

## How can I deploy this project to staysafeberkeley.org?

### Option 1: Publish via Lovable

1. Open [Lovable](https://lovable.dev/projects/2d3b3eee-540b-45c0-af92-188ab44e0d6a) and click on Share -> Publish.
2. After deployment, set up your DNS to point to the Lovable deployment.

### Option 2: Use Netlify with custom domain

1. Export your repository to GitHub.
2. Connect Netlify to your GitHub repository.
3. In Netlify, go to Domain settings and add your custom domain "staysafeberkeley.org".
4. Follow Netlify's instructions to update your DNS settings:
   - Add CNAME record pointing to your Netlify site
   - Or use Netlify DNS for complete management
5. Wait for DNS propagation (can take up to 48 hours).

### DNS Configuration

When connecting your custom domain to the deployed app, you'll need to set up the following DNS records:

- **A record**: Point the root domain to the IP address provided by your hosting provider.
- **CNAME record**: Point the "www" subdomain to your deployment URL.

## Domain ownership verification

Some platforms may require you to verify domain ownership by:
1. Adding a TXT record to your DNS settings
2. Uploading an HTML file to your domain
3. Adding a specific meta tag to your site's header

Follow the specific instructions provided by your chosen deployment platform.
```
